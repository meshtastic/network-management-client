use async_trait::async_trait;
use prost::Message;
use rand::{distributions::Standard, prelude::Distribution, Rng};
use serialport::SerialPort;
use std::{
    error::Error,
    io::ErrorKind::TimedOut,
    sync,
    thread::{self, JoinHandle},
    time::Duration,
};
use tokio::sync::broadcast;

use super::device;
use app::protobufs;

pub struct SerialConnection {
    pub on_decoded_packet: Option<broadcast::Receiver<protobufs::FromRadio>>,
    write_input_tx: Option<sync::mpsc::Sender<Vec<u8>>>,
    config_id: u32,
}

#[async_trait]
pub trait MeshConnection {
    fn new() -> Self;
    fn configure(&mut self) -> Result<(), Box<dyn Error>>;

    fn send_text(&mut self, text: impl Into<String>, channel: u32) -> Result<(), Box<dyn Error>>;
    fn send_packet(
        &mut self,
        byte_data: Vec<u8>,
        port_num: protobufs::PortNum,
        destination: u32,
        channel: u32,
    ) -> Result<(), Box<dyn Error>>;
    fn send_raw(&mut self, data: Vec<u8>) -> Result<(), Box<dyn Error>>;
    fn write_to_radio(port: &mut Box<dyn SerialPort>, data: Vec<u8>) -> Result<(), Box<dyn Error>>;

    async fn handle_packet_from_radio(
        variant: app::protobufs::from_radio::PayloadVariant,
        device: &mut device::MeshDevice,
    ) -> Result<bool, Box<dyn Error>>;

    async fn handle_mesh_packet(
        packet: protobufs::MeshPacket,
        device: &mut device::MeshDevice,
    ) -> Result<bool, Box<dyn Error>>;

    fn generate_rand_id<T>() -> T
    where
        Standard: Distribution<T>;
}

#[async_trait]
impl MeshConnection for SerialConnection {
    fn new() -> Self {
        SerialConnection {
            write_input_tx: None,
            on_decoded_packet: None,
            config_id: SerialConnection::generate_rand_id(),
        }
    }

    fn configure(&mut self) -> Result<(), Box<dyn Error>> {
        let to_radio = protobufs::ToRadio {
            payload_variant: Some(protobufs::to_radio::PayloadVariant::WantConfigId(
                self.config_id,
            )),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio.encode::<Vec<u8>>(&mut packet_buf)?;
        self.send_raw(packet_buf)?;

        Ok(())
    }

    fn send_text(&mut self, text: impl Into<String>, channel: u32) -> Result<(), Box<dyn Error>> {
        let byte_data = text.into().into_bytes();
        self.send_packet(byte_data, protobufs::PortNum::TextMessageApp, 0, channel)?;
        Ok(())
    }

    fn send_packet(
        &mut self,
        byte_data: Vec<u8>,
        port_num: protobufs::PortNum,
        destination: u32,
        channel: u32,
    ) -> Result<(), Box<dyn Error>> {
        let packet = protobufs::MeshPacket {
            payload_variant: Some(protobufs::mesh_packet::PayloadVariant::Decoded(
                protobufs::Data {
                    portnum: port_num as i32,
                    payload: byte_data,
                    want_response: false,
                    dest: destination,
                    source: self.config_id,
                    request_id: 0,
                    reply_id: 0,
                    emoji: 0,
                },
            )),
            rx_time: 0,           // not transmitted
            rx_snr: 0.0,          // not transmitted
            hop_limit: 0,         // not transmitted
            priority: 0,          // not transmitted
            rx_rssi: 0,           // not transmitted
            delayed: 0,           // not transmitted
            from: self.config_id, // random
            to: 4294967295,       // broadcast
            id: 0,                // random
            want_ack: false,
            channel,
        };

        let to_radio = protobufs::ToRadio {
            payload_variant: Some(protobufs::to_radio::PayloadVariant::Packet(packet)),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio.encode::<Vec<u8>>(&mut packet_buf)?;
        self.send_raw(packet_buf)?;

        Ok(())
    }

    fn send_raw(&mut self, data: Vec<u8>) -> Result<(), Box<dyn Error>> {
        if let Some(channel) = self.write_input_tx.as_ref() {
            channel.send(data)?;
        }

        Ok(())
    }

    fn write_to_radio(port: &mut Box<dyn SerialPort>, data: Vec<u8>) -> Result<(), Box<dyn Error>> {
        let magic_buffer = [0x94, 0xc3, 0x00, data.len() as u8];
        let packet_slice = data.as_slice();

        let binding = [&magic_buffer, packet_slice].concat();
        let message_buffer: &[u8] = binding.as_slice();
        port.write(message_buffer)?;

        Ok(())
    }

    async fn handle_packet_from_radio(
        variant: app::protobufs::from_radio::PayloadVariant,
        device: &mut device::MeshDevice,
    ) -> Result<bool, Box<dyn Error>> {
        let mut device_updated = false;

        match variant {
            protobufs::from_radio::PayloadVariant::Channel(c) => {
                device.add_channel(device::MeshChannel {
                    config: c,
                    last_interaction: device::get_current_time_u32(),
                    messages: vec![],
                });
                device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::Config(c) => {
                device.set_config(c.clone());
                device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::ConfigCompleteId(_c) => {
                // println!("Config complete id data: {:#?}", c);
            }
            protobufs::from_radio::PayloadVariant::LogRecord(_l) => {
                // println!("Log record data: {:#?}", l);
            }
            protobufs::from_radio::PayloadVariant::ModuleConfig(_m) => {
                // println!("Module config data: {:#?}", m);
            }
            protobufs::from_radio::PayloadVariant::MyInfo(m) => {
                device.set_hardware_info(m.clone());
                device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::NodeInfo(n) => {
                device.add_node_info(n.clone());
                device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::Packet(p) => {
                device_updated = SerialConnection::handle_mesh_packet(p, device).await?;
            }
            protobufs::from_radio::PayloadVariant::Rebooted(_r) => {
                // println!("Rebooted data: {:#?}", r);
            }
        };

        Ok(device_updated)
    }

    async fn handle_mesh_packet(
        packet: protobufs::MeshPacket,
        device: &mut device::MeshDevice,
    ) -> Result<bool, Box<dyn Error>> {
        let variant = packet.clone().payload_variant.ok_or("No payload variant")?;
        let mut device_updated = false;

        match variant {
            protobufs::mesh_packet::PayloadVariant::Decoded(data) => match data.portnum() {
                protobufs::PortNum::AdminApp => {
                    println!("Admin application not yet supported in Rust");
                }
                protobufs::PortNum::AtakForwarder => {
                    println!("ATAK forwarder not yet supported in Rust");
                }
                protobufs::PortNum::AudioApp => {
                    println!("Audio app not yet supported in Rust");
                }
                protobufs::PortNum::IpTunnelApp => {
                    println!("IP tunnel app not yet supported in Rust");
                }
                protobufs::PortNum::NodeinfoApp => {
                    let data = protobufs::User::decode(data.payload.as_slice())
                        .expect("Error decoding NodeInfo MeshPacket");
                    device.add_user(device::UserPacket { packet, data });
                    device_updated = true;
                }
                protobufs::PortNum::PositionApp => {
                    let data = protobufs::Position::decode(data.payload.as_slice())?;
                    device.add_position(device::PositionPacket { packet, data });
                    device_updated = true;
                }
                protobufs::PortNum::PrivateApp => {
                    println!("Private app not yet supported in Rust");
                }
                protobufs::PortNum::RangeTestApp => {
                    println!("Range test app not yet supported in Rust");
                }
                protobufs::PortNum::RemoteHardwareApp => {
                    println!("Remote hardware app not yet supported in Rust");
                }
                protobufs::PortNum::ReplyApp => {
                    println!("Reply app not yet supported in Rust");
                }
                protobufs::PortNum::RoutingApp => {
                    println!("Routing app not yet supported in Rust");
                }
                protobufs::PortNum::SerialApp => {
                    println!("Serial app not yet supported in Rust");
                }
                protobufs::PortNum::SimulatorApp => {
                    println!("Simulator app not yet supported in Rust");
                }
                protobufs::PortNum::StoreForwardApp => {
                    println!("Store forward packets not yet supported in Rust");
                }
                protobufs::PortNum::TelemetryApp => {
                    let data = protobufs::Telemetry::decode(data.payload.as_slice())?;
                    device.set_device_metrics(device::TelemetryPacket { packet, data });
                    device_updated = true;
                }
                protobufs::PortNum::TextMessageApp => {
                    let data = String::from_utf8(data.payload)?;

                    device.add_message(device::TextPacket { packet, data });
                    device_updated = true;
                }
                protobufs::PortNum::TextMessageCompressedApp => {
                    eprintln!("Compressed text data not yet supported in Rust");
                }
                protobufs::PortNum::WaypointApp => {
                    let data = protobufs::Waypoint::decode(data.payload.as_slice())?;
                    device.add_waypoint(data.clone());
                    device.add_waypoint_message(device::WaypointPacket { packet, data });
                    device_updated = true;
                }
                protobufs::PortNum::ZpsApp => {
                    println!("ZPS app not yet supported in Rust");
                }
                _ => {
                    println!("Unknown packet received");
                }
            },
            protobufs::mesh_packet::PayloadVariant::Encrypted(e) => {
                eprintln!("Encrypted packets not yet supported in Rust: {:#?}", e);
            }
        }

        Ok(device_updated)
    }

    fn generate_rand_id<T>() -> T
    where
        Standard: Distribution<T>,
    {
        let mut rng = rand::thread_rng();
        rng.gen::<T>()
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
        port_name: impl Into<String>,
        baud_rate: u32,
    ) -> Result<(JoinHandle<()>, JoinHandle<()>, JoinHandle<()>), Box<dyn Error>> {
        let mut port = serialport::new(port_name.into(), baud_rate).open()?;

        let (write_input_tx, write_input_rx) = sync::mpsc::channel::<Vec<u8>>();
        let (read_output_tx, read_output_rx) = sync::mpsc::channel::<Vec<u8>>();
        let (decoded_packet_tx, decoded_packet_rx) = broadcast::channel::<protobufs::FromRadio>(32);

        self.write_input_tx = Some(write_input_tx);
        self.on_decoded_packet = Some(decoded_packet_rx);

        let mut read_port = port.try_clone().expect("Could not clone read port");

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

        self.configure()?;

        Ok((
            serial_write_handle,
            serial_read_handle,
            message_processing_handle,
        ))
    }

    // pub async fn disconnect() -> Result<(), Box<dyn Error>> {
    //     Ok(())
    // }
}
