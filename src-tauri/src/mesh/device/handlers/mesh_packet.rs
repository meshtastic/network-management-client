use super::super::{
    helpers::{get_channel_name, get_node_user_name},
    ChannelMessageState, DeviceUpdateResult, MeshDevice, NeighborInfoPacket, NotificationConfig,
    PositionPacket, TelemetryPacket, TextPacket, UserPacket, WaypointPacket,
};
use app::protobufs;
use prost::Message;

impl MeshDevice {
    pub fn handle_mesh_packet(
        &mut self,
        packet: protobufs::MeshPacket,
    ) -> Result<DeviceUpdateResult, String> {
        let mut update_result = DeviceUpdateResult::new();
        let variant = packet.clone().payload_variant.ok_or("No payload variant")?;

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
                    update_result.device_updated = true;
                }
                protobufs::PortNum::PositionApp => {
                    let data = protobufs::Position::decode(data.payload.as_slice())
                        .map_err(|e| e.to_string())?;

                    self.add_position(PositionPacket { packet, data });

                    update_result.device_updated = true;
                    update_result.regenerate_graph = true;
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
                    let routing_data = protobufs::Routing::decode(data.payload.as_slice())
                        .map_err(|e| e.to_string())?;

                    if let Some(variant) = routing_data.variant {
                        match variant {
                            protobufs::routing::Variant::ErrorReason(e) => {
                                if let Some(r) = protobufs::routing::Error::from_i32(e) {
                                    match r {
                                        protobufs::routing::Error::None => {
                                            self.set_message_state(
                                                packet.channel,
                                                data.request_id,
                                                ChannelMessageState::Acknowledged,
                                            );
                                        }
                                        protobufs::routing::Error::Timeout => {
                                            self.set_message_state(
                                                packet.channel,
                                                data.request_id,
                                                ChannelMessageState::Error(
                                                    "Message timed out".into(),
                                                ),
                                            );
                                        }
                                        protobufs::routing::Error::MaxRetransmit => {
                                            self.set_message_state(
                                                packet.channel,
                                                data.request_id,
                                                ChannelMessageState::Error(
                                                    "Reached retransmit limit".into(),
                                                ),
                                            );
                                        }
                                        protobufs::routing::Error::GotNak => {
                                            self.set_message_state(
                                                packet.channel,
                                                data.request_id,
                                                ChannelMessageState::Error("Received NAK".into()),
                                            );
                                        }
                                        protobufs::routing::Error::TooLarge => {
                                            self.set_message_state(
                                                packet.channel,
                                                data.request_id,
                                                ChannelMessageState::Error(
                                                    "Message too large".into(),
                                                ),
                                            );
                                        }
                                        _ => {
                                            self.set_message_state(
                                                packet.channel,
                                                data.request_id,
                                                ChannelMessageState::Error(
                                                    "Message failed to send".into(),
                                                ),
                                            );
                                        }
                                    }
                                    update_result.device_updated = true;
                                }
                            }
                            protobufs::routing::Variant::RouteReply(r) => {
                                println!("Route reply: {:?}", r);
                            }
                            protobufs::routing::Variant::RouteRequest(r) => {
                                println!("Route request: {:?}", r);
                            }
                        }
                    }
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
                    update_result.device_updated = true;
                }
                protobufs::PortNum::TextMessageApp => {
                    let data = String::from_utf8(data.payload).map_err(|e| e.to_string())?;
                    self.add_text_message(TextPacket {
                        packet: packet.clone(),
                        data: data.clone(),
                    });

                    update_result.device_updated = true;

                    let from_user_name = get_node_user_name(self, &packet.from)
                        .unwrap_or_else(|| packet.from.to_string());

                    let channel_name = get_channel_name(self, &packet.channel)
                        .unwrap_or_else(|| "Unknown channel".into());

                    let mut notification = NotificationConfig::new();
                    notification.title = format!("{} in {}", from_user_name, channel_name);
                    notification.body = data;
                    update_result.notification_config = Some(notification);
                }
                protobufs::PortNum::TextMessageCompressedApp => {
                    eprintln!("Compressed text data not yet supported in Rust");
                }
                protobufs::PortNum::WaypointApp => {
                    let data = protobufs::Waypoint::decode(data.payload.as_slice())
                        .map_err(|e| e.to_string())?;

                    self.add_waypoint(data.clone());
                    self.add_waypoint_message(WaypointPacket {
                        packet: packet.clone(),
                        data: data.clone(),
                    });
                    update_result.device_updated = true;

                    let from_user_name = get_node_user_name(self, &packet.from)
                        .unwrap_or_else(|| packet.from.to_string());

                    let channel_name = get_channel_name(self, &packet.channel)
                        .unwrap_or_else(|| "Unknown channel".into());

                    let mut notification = NotificationConfig::new();
                    notification.title = format!("{} in {}", from_user_name, channel_name);
                    notification.body = format!(
                        "Sent waypoint \"{}\" at {}, {}",
                        data.name,
                        data.latitude_i as f32 / 1e7,
                        data.longitude_i as f32 / 1e7
                    );
                    update_result.notification_config = Some(notification);
                }
                protobufs::PortNum::ZpsApp => {
                    println!("ZPS app not yet supported in Rust");
                }
                protobufs::PortNum::NeighborinfoApp => {
                    let data = protobufs::NeighborInfo::decode(data.payload.as_slice())
                        .map_err(|e| e.to_string())?;

                    self.add_neighborinfo(NeighborInfoPacket {
                        packet: packet.clone(),
                        data,
                    });

                    update_result.device_updated = true;
                    update_result.regenerate_graph = true;
                }
                protobufs::PortNum::TracerouteApp => {
                    println!("Traceroute app not yet supported in Rust");
                }
                protobufs::PortNum::UnknownApp => {
                    println!("Unknown packet received");
                }
                protobufs::PortNum::Max => {
                    eprintln!("This is not a real PortNum, why did this happen");
                }
            },
            protobufs::mesh_packet::PayloadVariant::Encrypted(e) => {
                eprintln!("Encrypted packets not yet supported in Rust: {:#?}", e);
            }
        }

        Ok(update_result)
    }
}

#[cfg(test)]
mod tests {
    // use crate::mesh;

    // use super::*;

    // fn initialize_mock_device() -> mesh::device::MeshDevice {
    //     mesh::device::MeshDevice::new()
    // }

    #[test]
    fn test_node_info_app() {}
    #[test]
    fn test_position_app() {}
    #[test]
    fn test_routing_app_ack() {}
    #[test]
    fn test_routing_app_error() {}
    #[test]
    fn test_telemetry_app() {}
    #[test]
    fn test_text_message_app() {}
    #[test]
    fn test_waypoint_app() {}
    #[test]
    fn test_neighbor_info_app() {}
}
