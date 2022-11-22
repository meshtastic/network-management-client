mod algorithms;
mod aux_data_structures;
mod graph;

// Reference: https://rfdonnelly.github.io/posts/tauri-async-rust-process/

use std::{sync::Mutex, time::Duration};

use app::protobufs;
use prost::Message;
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

            info!(target: "async process", recv_count);
        }
    });

    true
}

#[tauri::command]
fn send_text(text: String, state: tauri::State<'_, ActiveSerialPort>) -> Vec<u8> {
    let mut guard = match state.port.lock() {
        Ok(p) => p,
        Err(_e) => return vec![],
    };

    let port = match &mut *guard {
        Some(p) => p,
        None => return vec![],
    };

    let byte_data = text.into_bytes();

    let packet = protobufs::MeshPacket {
        payload_variant: Some(protobufs::mesh_packet::PayloadVariant::Decoded(
            protobufs::Data {
                portnum: protobufs::PortNum::TextMessageApp as i32,
                payload: byte_data,
                want_response: false,
                dest: 0,
                source: 0,
                request_id: 0,
                reply_id: 0,
                emoji: 0,
            },
        )),
        // rx_time: None,
        // rx_snr: None,
        // hop_limit: None,
        // priority: None,
        // rx_rssi: None,
        // delayed: None,
        from: 75,
        to: 4294967295, // broadcast
        id: 0,
        want_ack: false,
        channel: 0,
    };

    let to_radio = protobufs::ToRadio {
        payload_variant: Some(protobufs::to_radio::PayloadVariant::Packet(packet)),
    };

    let mut packet_buf: Vec<u8> = vec![];
    to_radio.encode::<Vec<u8>>(&mut packet_buf).unwrap();

    let magic_buffer = [0x94, 0xc3, 0x00, packet_buf.len() as u8];
    let packet_slice = packet_buf.as_slice();

    let binding = [&magic_buffer, packet_slice].concat();
    let message_buffer: &[u8] = binding.as_slice();

    port.write(message_buffer)
        .expect("Could not write message to radio");

    binding
}

// __TAURI_INVOKE__("get_all_serial_ports").then(console.log).catch(console.error)
// __TAURI_INVOKE__("connect_to_serial_port", { portName: "/dev/ttyACM0" }).then(console.log).catch(console.error)
// __TAURI_INVOKE__("send_text", { text: "hello world" }).then(console.log).catch(console.error)
