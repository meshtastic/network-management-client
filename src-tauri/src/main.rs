mod algorithms;
mod aux_data_structures;
mod aux_functions;
mod graph;

// Reference: https://rfdonnelly.github.io/posts/tauri-async-rust-process/

use std::{sync::Mutex, time::Duration};

use serialport;
// use tokio::sync::mpsc;
use tracing::info;
use tracing_subscriber;

struct ActiveSerialPort {
    port: Mutex<Option<Box<dyn serialport::SerialPort>>>,
}

fn main() {
    tracing_subscriber::fmt::init();

    // let (serial_port_input_tx, serial_port_input_rx) = mpsc::channel(32);

    tauri::Builder::default()
        .manage(ActiveSerialPort {
            port: Mutex::new(None),
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
    let mut port = match serialport::new(port_name, 115_200)
        .timeout(Duration::from_millis(1000))
        .open()
    {
        Ok(p) => p,
        Err(_e) => return false,
    };

    let mut state_port = match state.port.lock() {
        Ok(p) => p,
        Err(_e) => return false,
    };

    *state_port = Some(port.try_clone().unwrap());

    // TODO handle terminating listener thread
    tauri::async_runtime::spawn(async move {
        let mut serial_buf: Vec<u8> = vec![0; 1024];
        let mut recv_count: usize = 0;

        loop {
            recv_count = match port.read(serial_buf.as_mut_slice()) {
                Ok(o) => o,
                Err(_e) => continue,
            };

            info!(target:"async process", recv_count);
        }
    });

    true
}
