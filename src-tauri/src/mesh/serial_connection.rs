use app::protobufs;
use async_trait::async_trait;
use prost::Message;
use serialport::SerialPort;
use std::{
    io::ErrorKind::TimedOut,
    sync,
    thread::{self, JoinHandle},
    time::Duration,
};
use tokio::sync::broadcast;

#[derive(Clone, Copy, Debug, Default)]
pub enum PacketDestination {
    SELF,
    #[default]
    BROADCAST,
    Node(u32),
}

#[derive(Debug, Default)]
pub struct SerialConnection {
    pub on_decoded_packet: Option<broadcast::Receiver<protobufs::FromRadio>>,
    pub my_node_info: Option<protobufs::MyNodeInfo>,
    write_input_tx: Option<sync::mpsc::Sender<Vec<u8>>>,
}

#[async_trait]
pub trait MeshConnection {
    fn new() -> Self;
    fn configure(&mut self, config_id: u32) -> Result<(), String>;
    fn send_raw(&mut self, data: Vec<u8>) -> Result<(), String>;
    fn write_to_radio(port: &mut Box<dyn SerialPort>, data: Vec<u8>) -> Result<(), String>;
}

#[async_trait]
impl MeshConnection for SerialConnection {
    fn new() -> Self {
        SerialConnection {
            write_input_tx: None,
            my_node_info: None,
            on_decoded_packet: None,
        }
    }

    fn configure(&mut self, config_id: u32) -> Result<(), String> {
        let to_radio = protobufs::ToRadio {
            payload_variant: Some(protobufs::to_radio::PayloadVariant::WantConfigId(config_id)),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio
            .encode::<Vec<u8>>(&mut packet_buf)
            .map_err(|e| e.to_string())?;

        self.send_raw(packet_buf)?;

        Ok(())
    }

    fn send_raw(&mut self, data: Vec<u8>) -> Result<(), String> {
        let channel = self
            .write_input_tx
            .as_ref()
            .ok_or("Could not send message to write channel")
            .map_err(|e| e.to_string())?;

        channel.send(data).map_err(|e| e.to_string())?;
        Ok(())
    }

    fn write_to_radio(port: &mut Box<dyn SerialPort>, data: Vec<u8>) -> Result<(), String> {
        let magic_buffer = [0x94, 0xc3, 0x00, data.len() as u8];
        let packet_slice = data.as_slice();

        let binding = [&magic_buffer, packet_slice].concat();
        let message_buffer: &[u8] = binding.as_slice();
        port.write(message_buffer).map_err(|e| e.to_string())?;

        Ok(())
    }
}

impl SerialConnection {
    pub fn get_available_ports() -> Result<Vec<String>, String> {
        let available_ports = serialport::available_ports().map_err(|e| e.to_string())?;

        let ports: Vec<String> = available_ports
            .iter()
            .map(|p| p.port_name.clone())
            .collect();

        Ok(ports)
    }

    pub fn connect(
        &mut self,
        port_name: String,
        baud_rate: u32,
    ) -> Result<(JoinHandle<()>, JoinHandle<()>, JoinHandle<()>), String> {
        let mut port = serialport::new(port_name.clone(), baud_rate)
            .timeout(Duration::from_millis(10))
            .open()
            .map_err(|e| {
                format!(
                    "Could not open serial port \"{}\": {}",
                    port_name.clone(),
                    e.to_string()
                )
                .to_owned()
            })?;

        let (write_input_tx, write_input_rx) = sync::mpsc::channel::<Vec<u8>>();
        let (read_output_tx, read_output_rx) = sync::mpsc::channel::<Vec<u8>>();
        let (decoded_packet_tx, decoded_packet_rx) = broadcast::channel::<protobufs::FromRadio>(32);

        self.write_input_tx = Some(write_input_tx);
        self.on_decoded_packet = Some(decoded_packet_rx);

        let mut read_port = port.try_clone().map_err(|e| {
            format!(
                "Could not clone serial port \"{}\": {}",
                port_name.clone(),
                e.to_string()
            )
            .to_owned()
        })?;

        let serial_write_handle = thread::spawn(move || loop {
            if let Ok(data) = write_input_rx.recv() {
                match SerialConnection::write_to_radio(&mut port, data) {
                    Ok(()) => (),
                    Err(e) => eprintln!("Error writing to radio: {:?}", e.to_string()),
                };
            }
        });

        let serial_read_handle = thread::spawn(move || loop {
            let mut incoming_serial_buf: Vec<u8> = vec![0; 1024];

            let recv_bytes = match read_port.read(incoming_serial_buf.as_mut_slice()) {
                Ok(o) => o,
                Err(ref e) if e.kind() == TimedOut => continue,
                Err(err) => {
                    eprintln!("Read failed: {:?}", err);
                    continue;
                }
            };

            match read_output_tx.send(incoming_serial_buf[..recv_bytes].to_vec()) {
                Ok(()) => (),
                Err(e) => eprintln!("Error sending to recv channel: {:?}", e.to_string()),
            };
        });

        let message_processing_handle = thread::spawn(move || {
            let mut transform_serial_buf: Vec<u8> = vec![0; 1024];

            loop {
                if let Ok(message) = read_output_rx.recv() {
                    let mut message = message.clone();
                    transform_serial_buf.append(&mut message);
                    let mut processing_exhausted = false;

                    // While there are still bytes in the buffer and processing isn't completed,
                    // continue processing the buffer
                    while transform_serial_buf.len() != 0 && !processing_exhausted {
                        // All valid packets start with the sequence [0x94 0xc3 size_msb size_lsb], where
                        // size_msb and size_lsb collectively give the size of the incoming packet
                        // Note that the maximum packet size currently stands at 240 bytes, meaning an MSB is not needed
                        let framing_index =
                            match transform_serial_buf.iter().position(|&b| b == 0x94) {
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
                                // * Packet incomplete
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
                        let incoming_packet_size: usize =
                            4 + shifted_msb as usize + (*lsb as usize);

                        if transform_serial_buf.len() < incoming_packet_size {
                            processing_exhausted = true;
                            continue;
                        }

                        // Get packet data, excluding magic bytes
                        let packet: Vec<u8> =
                            transform_serial_buf[4..incoming_packet_size].to_vec();

                        // Packet is malformed if the start of another packet occurs within the
                        // defined limits of the current packet
                        let malformed_packet_detector_index =
                            packet.iter().position(|&b| b == 0x94);

                        let malformed_packet_detector_byte =
                            if let Some(index) = malformed_packet_detector_index {
                                packet.get(index + 1)
                            } else {
                                None
                            };

                        if *malformed_packet_detector_byte.unwrap_or(&0) == 0xc3 {
                            // ! This is dicey, should be abstracted into a function that returns an option
                            let next_packet_start_idx: usize =
                                malformed_packet_detector_index.unwrap();

                            // Remove malformed packet from buffer
                            transform_serial_buf =
                                transform_serial_buf[next_packet_start_idx..].to_vec();

                            continue;
                        }

                        let start_of_next_packet_idx: usize =
                            3 + (shifted_msb as usize) + ((*lsb) as usize) + 1; // ? Why this way?

                        // Remove valid packet from buffer
                        transform_serial_buf =
                            transform_serial_buf[start_of_next_packet_idx..].to_vec();

                        let decoded_packet = match protobufs::FromRadio::decode(packet.as_slice()) {
                            Ok(d) => d,
                            Err(err) => {
                                eprintln!("deserialize failed: {:?}", err);
                                continue;
                            }
                        };

                        decoded_packet_tx.send(decoded_packet).unwrap();
                    }
                }
            }
        });

        thread::sleep(Duration::from_millis(200)); // Device stability

        Ok((
            serial_write_handle,
            serial_read_handle,
            message_processing_handle,
        ))
    }

    // pub async fn disconnect() -> Result<(), String> {
    //     Ok(())
    // }
}
