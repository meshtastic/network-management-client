mod algorithms;
mod aux_data_structures;
mod aux_functions;
mod graph;
mod mesh;
mod mocks;

use app::protobufs;
use aux_functions::commands::{run_articulation_point, run_global_mincut, run_stoer_wagner};
use mesh::serial_connection::{MeshConnection, SerialConnection};
use std::sync::Arc;
use tauri::{async_runtime, Manager};
use tracing_subscriber;

struct ActiveSerialConnection {
    inner: Arc<async_runtime::Mutex<Option<mesh::serial_connection::SerialConnection>>>,
}

struct ActiveMeshDevice {
    inner: Arc<async_runtime::Mutex<Option<mesh::device::MeshDevice>>>,
}

fn main() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .manage(ActiveSerialConnection {
            inner: Arc::new(async_runtime::Mutex::new(None)),
        })
        .manage(ActiveMeshDevice {
            inner: Arc::new(async_runtime::Mutex::new(Some(
                mesh::device::MeshDevice::new(),
            ))),
        })
        .invoke_handler(tauri::generate_handler![
            run_articulation_point,
            run_global_mincut,
            run_stoer_wagner
        ])
        .invoke_handler(tauri::generate_handler![
            get_all_serial_ports,
            connect_to_serial_port,
            disconnect_from_serial_port,
            send_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_all_serial_ports() -> Result<Vec<String>, String> {
    SerialConnection::get_available_ports()
}

#[tauri::command]
async fn connect_to_serial_port(
    port_name: String,
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), String> {
    let mut connection = SerialConnection::new();
    connection
        .connect(port_name, 115_200)
        .expect("Could not connect to serial port at 115_200 baud");

    let mut decoded_listener = connection
        .on_decoded_packet
        .as_ref()
        .ok_or("Decoded packet listener not open")?
        .resubscribe();

    let handle = app_handle.app_handle().clone();
    let mesh_device_arc = mesh_device.inner.clone();

    {
        let mut new_device = mesh_device_arc.lock().await;
        *new_device = Some(mesh::device::MeshDevice::new());
    }

    tauri::async_runtime::spawn(async move {
        loop {
            if let Ok(message) = decoded_listener.recv().await {
                let variant = match message.payload_variant {
                    Some(v) => v,
                    None => continue,
                };

                let mut device_guard = mesh_device_arc.lock().await;

                let device = match device_guard.as_mut().ok_or("Device not initialized") {
                    Ok(d) => d,
                    Err(e) => {
                        eprintln!("{:?}", e);
                        continue;
                    }
                };

                let device_updated =
                    match SerialConnection::handle_packet_from_radio(variant, device).await {
                        Ok(d) => d,
                        Err(e) => {
                            eprintln!("Error transmitting packet: {}", e.to_string());
                            continue;
                        }
                    };

                if device_updated {
                    match dispatch_updated_device(handle.clone(), device.clone()) {
                        Ok(_) => (),
                        Err(e) => {
                            eprintln!("Error emitting event to client: {:?}", e.to_string());
                            continue;
                        }
                    };
                }
            }
        }
    });

    {
        let mut state_connection = serial_connection.inner.lock().await;
        *state_connection = Some(connection);
    }

    Ok(())
}

#[tauri::command]
async fn disconnect_from_serial_port(
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), String> {
    {
        let mut state_connection = serial_connection.inner.lock().await;
        *state_connection = None;
    }

    {
        let mut state_device = mesh_device.inner.lock().await;
        *state_device = None;
    }

    Ok(())
}

fn dispatch_updated_device(
    handle: tauri::AppHandle,
    device: mesh::device::MeshDevice,
) -> tauri::Result<()> {
    handle.emit_all("device_update", device)
}

#[tauri::command]
async fn send_text(
    text: String,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), String> {
    let mut guard = serial_connection.inner.lock().await;
    let connection = guard.as_mut().expect("Connection not initialized");
    connection
        .send_text(text.clone(), 0)
        .map_err(|e| e.to_string())?;

    let mut device_guard = mesh_device.inner.lock().await;

    let device = device_guard
        .as_mut()
        .ok_or("Device not connected")
        .map_err(|e| e.to_string())?;

    device.add_message(mesh::device::TextPacket {
        packet: protobufs::MeshPacket {
            rx_time: mesh::device::get_current_time_u32(),
            channel,
            ..Default::default()
        },
        data: text,
    });

    dispatch_updated_device(app_handle, device.clone()).map_err(|e| e.to_string())?;

    Ok(())
}
