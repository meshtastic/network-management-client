use app::protobufs;
use prost::Message;
use tauri::api::notification::Notification;

use super::{
    helpers::get_current_time_u32, MeshChannel, MeshDevice, PositionPacket, TelemetryPacket,
    TextPacket, UserPacket, WaypointPacket,
};

use crate::constructors::mock::mocks;

impl MeshDevice {
    pub fn handle_packet_from_radio(
        &mut self,
        variant: app::protobufs::from_radio::PayloadVariant,
        app_handle: Option<tauri::AppHandle>,
    ) -> Result<bool, String> {
        let mut device_updated = false;

        match variant {
            protobufs::from_radio::PayloadVariant::Channel(c) => {
                self.add_channel(MeshChannel {
                    config: c,
                    last_interaction: get_current_time_u32(),
                    messages: vec![],
                });
                device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::Config(c) => {
                self.set_config(c.clone());
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
                self.set_hardware_info(m.clone());
                device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::NodeInfo(n) => {
                self.add_node_info(n.clone());
                device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::Packet(p) => {
                device_updated = self.handle_mesh_packet(p, app_handle)?;
            }
            protobufs::from_radio::PayloadVariant::QueueStatus(_q) => {
                // println!("Queue status data: {:#?}", q);
            }
            protobufs::from_radio::PayloadVariant::Rebooted(_r) => {
                // println!("Rebooted data: {:#?}", r);
            }
            protobufs::from_radio::PayloadVariant::XmodemPacket(_p) => {
                // println!("Xmodem packet: {:#?}", p);
            }
        };

        Ok(device_updated)
    }

    pub fn handle_mesh_packet(
        &mut self,
        packet: protobufs::MeshPacket,
        app_handle: Option<tauri::AppHandle>,
    ) -> Result<bool, String> {
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
                        .map_err(|e| e.to_string())?;

                    self.add_user(UserPacket { packet, data });
                    device_updated = true;
                }
                protobufs::PortNum::PositionApp => {
                    let data = protobufs::Position::decode(data.payload.as_slice())
                        .map_err(|e| e.to_string())?;

                    self.add_position(PositionPacket { packet, data });
                    //TODO: edge map generation from position packets should be temporary
                    self.edges = mocks::mock_edge_map_from_loc_info(self.nodes.clone(), None);
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
                    let data = protobufs::Telemetry::decode(data.payload.as_slice())
                        .map_err(|e| e.to_string())?;

                    self.set_device_metrics(TelemetryPacket { packet, data });
                    device_updated = true;
                }
                protobufs::PortNum::TextMessageApp => {
                    let data = String::from_utf8(data.payload).map_err(|e| e.to_string())?;
                    self.add_text_message(TextPacket {
                        packet: packet.clone(),
                        data: data.clone(),
                    });
                    device_updated = true;

                    if let Some(handle) = app_handle {
                        Notification::new(handle.config().tauri.bundle.identifier.clone())
                            .title(format!("Message on channel {}", packet.channel))
                            .body(data)
                            .notify(&handle)
                            .map_err(|e| e.to_string())?;
                    }
                }
                protobufs::PortNum::TextMessageCompressedApp => {
                    eprintln!("Compressed text data not yet supported in Rust");
                }
                protobufs::PortNum::WaypointApp => {
                    let data = protobufs::Waypoint::decode(data.payload.as_slice())
                        .map_err(|e| e.to_string())?;

                    self.add_waypoint(data.clone());
                    self.add_waypoint_message(WaypointPacket { packet, data });
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
}
