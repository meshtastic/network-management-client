mod algorithms;
mod aux_data_structures;
mod graph;

// Reference: https://rfdonnelly.github.io/posts/tauri-async-rust-process/

use std::{sync::Mutex, time::Duration};

use serialport;
// use tokio::sync::mpsc;

struct ActiveSerialPort {
    port: Mutex<Option<Box<dyn serialport::SerialPort>>>,
}
mod aux_functions;
use aux_functions::commands::{run_articulation_point, run_global_mincut, run_stoer_wagner};
// use tauri::Manager;
use tracing::info;
use tracing_subscriber;

fn main() {
    tracing_subscriber::fmt::init();

    // let (serial_port_input_tx, serial_port_input_rx) = mpsc::channel(32);

    tauri::Builder::default()
        .manage(ActiveSerialPort {
            port: Mutex::new(None),
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

#[tauri::command]
fn send_text(_text: String, state: tauri::State<'_, ActiveSerialPort>) -> i32 {
    let mut guard = match state.port.lock() {
        Ok(p) => p,
        Err(_e) => return -1,
    };

    let port = match &mut *guard {
        Some(p) => p,
        None => return -1,
    };

    let buf1: [u8; 33] = [
        0x94, 0xc3, 0x00, 29, 10, 27, 21, 255, 255, 255, 255, 34, 15, 8, 1, 18, 11, 104, 101, 108,
        108, 111, 32, 119, 111, 114, 108, 100, 53, 210, 194, 112, 17,
    ];

    let buf2: [u8; 6] = [0x94, 0xc3, 0x00, 2, 24, 1];

    let mut bytes_sent = 0;

    bytes_sent += port.write(&buf1).expect("Could not write first message");
    bytes_sent += port.write(&buf2).expect("Could not write second message");

    bytes_sent as i32
}

// __TAURI_INVOKE__("get_all_serial_ports").then(console.log).catch(console.error)
// __TAURI_INVOKE__("connect_to_serial_port", { portName: "/dev/ttyACM0" }).then(console.log).catch(console.error)
// __TAURI_INVOKE__("send_text", { Text: "hey" }).then(console.log).catch(console.error)
