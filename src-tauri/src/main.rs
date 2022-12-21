mod algorithms;
mod aux_data_structures;
mod graph;
mod mesh;

use mesh::serial_connection::{MeshConnection, SerialConnection};
use redux_rs::Store;
use std::sync::{Arc, Mutex};
use tauri::Manager;
use tokio::sync::mpsc;

struct ActiveSerialConnection {
    inner: Arc<Mutex<Option<mesh::serial_connection::SerialConnection>>>,
}

mod aux_functions;
use aux_functions::commands::{run_articulation_point, run_global_mincut, run_stoer_wagner};
use tracing_subscriber;

fn main() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .manage(ActiveSerialConnection {
            inner: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            run_articulation_point,
            run_global_mincut,
            run_stoer_wagner
        ])
        .invoke_handler(tauri::generate_handler![
            get_all_serial_ports,
            connect_to_serial_port,
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
fn connect_to_serial_port(
    port_name: String,
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), String> {
    let mut connection: SerialConnection = MeshConnection::new();
    connection.connect(port_name, 115_200).unwrap();

    let mut decoded_listener = connection
        .on_decoded_packet
        .as_ref()
        .ok_or("Decoded packet listener not open")?
        .resubscribe();

    let handle = app_handle.app_handle().clone();
    let (tx, mut rx) = mpsc::channel::<mesh::store::MeshPacketActions>(32);

    tauri::async_runtime::spawn(async move {
        let store = Store::new(mesh::store::message_reducer);
        let handle = app_handle.app_handle().clone();

        store
            .subscribe(|state: &mesh::store::MessagesState| println!("New state: {:?}", state))
            .await;

        loop {
            if let Some(message) = rx.recv().await {
                store.dispatch(message).await;

                let cloned_store = store.state_cloned().await;
                match handle.emit_all("message_update", cloned_store) {
                    Ok(_) => (),
                    Err(e) => {
                        eprintln!("Error emitting updated message state: {:?}", e.to_string());
                        continue;
                    }
                };
            }
        }
    });

    tauri::async_runtime::spawn(async move {
        loop {
            if let Ok(message) = decoded_listener.recv().await {
                let variant = match message.payload_variant {
                    Some(v) => v,
                    None => continue,
                };

                match SerialConnection::dispatch_packet(handle.clone(), variant, tx.clone()).await {
                    Ok(_) => (),
                    Err(e) => {
                        eprintln!("Error transmitting packet: {}", e.to_string());
                        continue;
                    }
                };
            }
        }
    });

    {
        let mut state_connection = state.inner.lock().unwrap();
        *state_connection = Some(connection);
    }

    Ok(())
}

#[tauri::command]
fn send_text(text: String, state: tauri::State<'_, ActiveSerialConnection>) -> Result<(), String> {
    let mut guard = state.inner.lock().unwrap();
    let connection = guard.as_mut().expect("Connection not initialized");
    connection.send_text(text, 0).map_err(|e| e.to_string())?;

    Ok(())
}
