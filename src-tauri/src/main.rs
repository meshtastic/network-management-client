mod algorithms;
mod aux_data_structures;
mod aux_functions;
mod graph;

// Reference: https://rfdonnelly.github.io/posts/tauri-async-rust-process/

use std::{sync::Mutex, time::Duration};

// use tokio::sync::mpsc;
use serialport;
use tracing_subscriber;

struct ActiveSerialPort {
    inner: Mutex<Option<Box<dyn serialport::SerialPort>>>,
}

fn main() {
    tracing_subscriber::fmt::init();

    // let (serial_port_input_tx, serial_port_input_rx) = mpsc::channel(32);

    tauri::Builder::default()
        .manage(ActiveSerialPort {
            inner: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            get_all_serial_ports,
            connect_to_serial_port
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_all_serial_ports() -> Vec<String> {
    let mut ports: Vec<String> = vec![];

    for port in serialport::available_ports().expect("No ports found!") {
        ports.push(port.port_name);
    }

    ports
}

#[tauri::command]
fn connect_to_serial_port(port_name: String, state: tauri::State<'_, ActiveSerialPort>) -> bool {
    let port = match serialport::new(port_name, 115_200)
        .timeout(Duration::from_millis(200))
        .open()
    {
        Ok(p) => p,
        Err(_e) => return false,
    };

    let mut state_port = match state.inner.lock() {
        Ok(p) => p,
        Err(_e) => return false,
    };

    *state_port = Some(port);
    true
}
