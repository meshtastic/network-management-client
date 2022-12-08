mod algorithms;
mod aux_data_structures;
mod graph;
mod mesh;

// Reference: https://rfdonnelly.github.io/posts/tauri-async-rust-process/

use app::protobufs;
use mesh::serial_connection::{MeshConnection, SerialConnection};
use std::error::Error;
use std::sync::{Arc, Mutex};
use tauri::Manager;

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
fn get_all_serial_ports() -> Vec<String> {
    SerialConnection::get_available_ports()
}

#[tauri::command]
fn connect_to_serial_port(
    port_name: String,
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, ActiveSerialConnection>,
) -> bool {
    let mut connection: SerialConnection = MeshConnection::new();

    // ? Might be able to return the listener from here
    match connection.connect(port_name, 115_200) {
        Ok(_h) => (),
        Err(_e) => {
            eprintln!("Could not connect to radio");
            return false;
        }
    };

    let mut decoded_listener = match connection.on_decoded_packet.as_ref() {
        Some(l) => l.resubscribe(),
        None => {
            eprintln!("Decoded packet listener not open");
            return false;
        }
    };

    let handle = app_handle.app_handle().clone();

    tauri::async_runtime::spawn(async move {
        loop {
            if let Ok(message) = decoded_listener.recv().await {
                let variant = match message.payload_variant {
                    Some(v) => v,
                    None => continue,
                };

                match dispatch_packet(handle.clone(), variant) {
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

    true
}

fn dispatch_packet(
    handle: tauri::AppHandle,
    variant: app::protobufs::from_radio::PayloadVariant,
) -> Result<(), Box<dyn Error>> {
    match variant {
        protobufs::from_radio::PayloadVariant::Channel(c) => {
            println!("Channel data: {:#?}", c);
            handle.emit_all("channel", c)?;
        }
        protobufs::from_radio::PayloadVariant::Config(c) => {
            // println!("Config data: {:#?}", c);
            handle.emit_all("config", c)?;
        }
        protobufs::from_radio::PayloadVariant::ConfigCompleteId(c) => {
            // println!("Config complete id data: {:#?}", c);
            handle.emit_all("config_complete", c)?;
        }
        protobufs::from_radio::PayloadVariant::LogRecord(l) => {
            // println!("Log record data: {:#?}", l);
            handle.emit_all("log_record", l)?;
        }
        protobufs::from_radio::PayloadVariant::ModuleConfig(m) => {
            // println!("Module config data: {:#?}", m);
            handle.emit_all("module_config", m)?;
        }
        protobufs::from_radio::PayloadVariant::MyInfo(m) => {
            // println!("My node info data: {:#?}", m);
            handle.emit_all("my_node_info", m)?;
        }
        protobufs::from_radio::PayloadVariant::NodeInfo(n) => {
            // println!("Node info data: {:#?}", n);
            handle.emit_all("node_info", n)?;
        }
        protobufs::from_radio::PayloadVariant::Packet(p) => {
            // println!("Packet data: {:#?}", p);
            handle_mesh_packet(handle, p)?;
        }
        protobufs::from_radio::PayloadVariant::Rebooted(r) => {
            // println!("Rebooted data: {:#?}", r);
            handle.emit_all("reboot", r)?;
        }
    };

    Ok(())
}

fn handle_mesh_packet(
    handle: tauri::AppHandle,
    packet: protobufs::MeshPacket,
) -> Result<(), Box<dyn Error>> {
    let variant = packet.payload_variant.ok_or("No payload variant")?;

    match variant {
        protobufs::mesh_packet::PayloadVariant::Decoded(d) => {
            println!("Decoded: {:#?}", d);
            handle_decoded_mesh_packet(handle, d)?;
        }
        protobufs::mesh_packet::PayloadVariant::Encrypted(e) => {
            eprintln!("Encrypted packets not yet supported in Rust: {:#?}", e);
        }
    }

    Ok(())
}

fn handle_decoded_mesh_packet(
    handle: tauri::AppHandle,
    data: protobufs::Data,
) -> Result<(), Box<dyn Error>> {
    match data.portnum() {
        protobufs::PortNum::AdminApp => {
            eprintln!("Admin application not yet supported in Rust");
        }
        protobufs::PortNum::AtakForwarder => {
            eprintln!("ATAK forwarder not yet supported in Rust");
        }
        protobufs::PortNum::AudioApp => {
            eprintln!("Audio app not yet supported in Rust");
        }
        protobufs::PortNum::IpTunnelApp => {
            eprintln!("IP tunnel app not yet supported in Rust");
        }
        protobufs::PortNum::NodeinfoApp => {
            eprintln!("Node info app not yet supported in Rust");
        }
        protobufs::PortNum::PositionApp => {
            handle.emit_all("position", data)?;
        }
        protobufs::PortNum::PrivateApp => {
            eprintln!("Private app not yet supported in Rust");
        }
        protobufs::PortNum::RangeTestApp => {
            eprintln!("Range test app not yet supported in Rust");
        }
        protobufs::PortNum::RemoteHardwareApp => {
            eprintln!("Remote hardware app not yet supported in Rust");
        }
        protobufs::PortNum::ReplyApp => {
            eprintln!("Reply app not yet supported in Rust");
        }
        protobufs::PortNum::RoutingApp => {
            handle.emit_all("routing", data)?;
        }
        protobufs::PortNum::SerialApp => {
            eprintln!("Serial app not yet supported in Rust");
        }
        protobufs::PortNum::SimulatorApp => {
            eprintln!("Simulator app not yet supported in Rust");
        }
        protobufs::PortNum::StoreForwardApp => {
            eprintln!("Store forward packets not yet supported in Rust");
        }
        protobufs::PortNum::TelemetryApp => {
            handle.emit_all("telemetry", data)?;
        }
        protobufs::PortNum::TextMessageApp => {
            handle.emit_all("text", data)?;
        }
        protobufs::PortNum::TextMessageCompressedApp => {
            eprintln!("Compressed text data not yet supported in Rust");
        }
        protobufs::PortNum::WaypointApp => {
            eprintln!("Waypoint app not yet supported in Rust");
        }
        protobufs::PortNum::ZpsApp => {
            eprintln!("ZPS app not yet supported in Rust");
        }
        _ => {
            eprintln!("Unknown packet received");
        }
    }

    Ok(())
}

#[tauri::command]
fn send_text(text: String, state: tauri::State<'_, ActiveSerialConnection>) -> bool {
    let mut guard = state.inner.lock().unwrap();
    let connection = guard.as_mut().expect("Connection not initialized");
    let result = connection.send_text(text, 0);

    match result {
        Ok(()) => (),
        Err(_e) => {
            eprintln!("Could not send text to radio");
            return false;
        }
    };

    true
}

// __TAURI_INVOKE__("get_all_serial_ports").then(console.log).catch(console.error)
// __TAURI_INVOKE__("connect_to_serial_port", { portName: "/dev/ttyACM0" }).then(console.log).catch(console.error)
// __TAURI_INVOKE__("send_text", { text: "hello world" }).then(console.log).catch(console.error)
