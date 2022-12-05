mod algorithms;
mod aux_data_structures;
mod graph;

// Reference: https://rfdonnelly.github.io/posts/tauri-async-rust-process/

use std::{io::ErrorKind::TimedOut, sync::Mutex};

use app::protobufs;
use prost::Message;
use serialport;

struct ActiveSerialPort {
    port: Mutex<Option<Box<dyn serialport::SerialPort>>>,
}
mod aux_functions;
use aux_functions::commands::{run_articulation_point, run_global_mincut, run_stoer_wagner};
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
fn connect_to_serial_port(port_name: String, _state: tauri::State<'_, ActiveSerialPort>) -> bool {
    let mut port = match serialport::new(port_name, 115_200).open() {
        Ok(p) => p,
        Err(_e) => return false,
    };

    // TODO: Move configuration into separate function
    let configuration_packet = protobufs::ToRadio {
        // ! This is a random config number that needs to be standardized
        payload_variant: Some(protobufs::to_radio::PayloadVariant::WantConfigId(1)),
    };

    let mut packet_buf: Vec<u8> = vec![];
    configuration_packet
        .encode::<Vec<u8>>(&mut packet_buf)
        .unwrap();

    let magic_buffer = [0x94, 0xc3, 0x00, packet_buf.len() as u8];
    let packet_slice = packet_buf.as_slice();

    let binding = [&magic_buffer, packet_slice].concat();
    let message_buffer: &[u8] = binding.as_slice();

    // Stability
    let config_sleep_duration = std::time::Duration::from_millis(200);
    std::thread::sleep(config_sleep_duration);

    port.write(message_buffer)
        .expect("Could not write config packet to radio");

    // ---- end config ---- //

    // TODO need to find a way to handle mutex locking within spawned thread
    // let mut state_port = match state.port.lock() {
    //     Ok(p) => p,
    //     Err(_e) => return false,
    // };

    // *state_port = Some(port.try_clone().unwrap());

    // TODO handle terminating listener thread
    tauri::async_runtime::spawn(async move {
        let mut incoming_serial_buf: Vec<u8> = vec![0; 1024];
        let mut transform_serial_buf: Vec<u8> = vec![0; 1024];

        loop {
            let recv_bytes = match port.read(incoming_serial_buf.as_mut_slice()) {
                Ok(o) => o,
                Err(ref e) if e.kind() == TimedOut => continue,
                Err(err) => {
                    eprintln!("Read failed: {:?}", err);
                    continue;
                }
            };

            let mut recv_slice: &[u8] = incoming_serial_buf.as_slice();
            recv_slice = &recv_slice[..recv_bytes];

            transform_serial_buf.append(&mut recv_slice.to_vec());
            let mut processing_exhausted = false;

            // While there are still bytes in the buffer and processing isn't completed,
            // continue processing the buffer
            while transform_serial_buf.len() != 0 && !processing_exhausted {
                // All valid packets start with the sequence [0x94 0xc3 size_msb size_lsb], where
                // size_msb and size_lsb collectively give the size of the incoming packet
                // Note that the maximum packet size currently stands at 240 bytes, meaning an MSB is not needed
                let framing_index = match transform_serial_buf.iter().position(|&b| b == 0x94) {
                    Some(idx) => idx,
                    None => {
                        eprintln!("Could not find index of 0x94");
                        processing_exhausted = true;
                        continue;
                    }
                };

                let framing_byte = match transform_serial_buf.get(framing_index + 1) {
                    Some(val) => val,
                    None => {
                        // println!("Could not find position of 0xc3, packet incomplete");
                        processing_exhausted = true;
                        continue;
                    }
                };

                if *framing_byte != 0xc3 {
                    processing_exhausted = true;
                    continue;
                }

                // Drop beginning of buffer if the framing byte is found later in the buffer
                // It is not possible to make a valid packet if the framing byte is not at the beginning
                if framing_index > 0 {
                    transform_serial_buf = transform_serial_buf[framing_index..].to_vec();
                }

                let msb = match transform_serial_buf.get(2) {
                    Some(val) => val,
                    None => {
                        // TODO This should be abstracted into a function, repeated in many places
                        eprintln!("Could not find value for MSB");
                        processing_exhausted = true;
                        continue;
                    }
                };

                let lsb = match transform_serial_buf.get(3) {
                    Some(val) => val,
                    None => {
                        eprintln!("Could not find value for LSB");
                        processing_exhausted = true;
                        continue;
                    }
                };

                // Combine MSB and LSB of incoming packet size bytes
                // * NOTE: packet size doesn't consider the first four magic bytes
                let shifted_msb: u32 = (*msb as u32).checked_shl(8).unwrap_or(0);
                let incoming_packet_size: usize = 4 + shifted_msb as usize + (*lsb as usize);

                if transform_serial_buf.len() < incoming_packet_size {
                    processing_exhausted = true;
                    continue;
                }

                // Get packet data, excluding magic bytes
                let packet: Vec<u8> = transform_serial_buf[4..incoming_packet_size].to_vec();

                // Packet is malformed if the start of another packet occurs within the
                // defined limits of the current packet
                let malformed_packet_detector_index = packet.iter().position(|&b| b == 0x94);

                let malformed_packet_detector_byte = if malformed_packet_detector_index.is_some() {
                    packet.get(malformed_packet_detector_index.unwrap() + 1)
                } else {
                    None
                };

                if malformed_packet_detector_byte.is_some()
                    && *malformed_packet_detector_byte.unwrap_or(&0) == 0xc3
                {
                    // ! This is dicey, should be abstracted into a function that returns an option
                    let next_packet_start_idx: usize = malformed_packet_detector_index.unwrap();

                    // Remove malformed packet from buffer
                    transform_serial_buf = transform_serial_buf[next_packet_start_idx..].to_vec();

                    continue;
                }

                let start_of_next_packet_idx: usize =
                    3 + (shifted_msb as usize) + ((*lsb) as usize) + 1; // ? Why this way?

                // Remove valid packet from buffer
                transform_serial_buf = transform_serial_buf[start_of_next_packet_idx..].to_vec();

                let deserialized = match protobufs::FromRadio::decode(packet.as_slice()) {
                    Ok(d) => d,
                    Err(err) => {
                        println!("deserialize failed: {:?}", err);
                        continue;
                    }
                };

                println!("Decoded packet: {:#?}", deserialized);
            }
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
        rx_time: 0,     // not transmitted
        rx_snr: 0.0,    // not transmitted
        hop_limit: 0,   // not transmitted
        priority: 0,    // not transmitted
        rx_rssi: 0,     // not transmitted
        delayed: 0,     // not transmitted
        from: 75,       // random
        to: 4294967295, // broadcast
        id: 0,          // random
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
