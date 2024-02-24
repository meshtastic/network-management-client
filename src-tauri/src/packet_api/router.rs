use meshtastic::connections::PacketRouter;
use meshtastic::protobufs;

use super::handlers::{
    from_radio::handlers as from_radio_handlers, mesh_packet::handlers as mesh_packet_handlers,
    DeviceUpdateError, DeviceUpdateMetadata,
}; // TODO place these handlers within this directory

use super::MeshPacketApi;

impl<R: tauri::Runtime> PacketRouter<DeviceUpdateMetadata, DeviceUpdateError> for MeshPacketApi<R> {
    fn get_source_node_id(&self) -> u32 {
        self.device.my_node_info.my_node_num
    }

    fn handle_packet_from_radio(
        &mut self,
        packet: protobufs::FromRadio,
    ) -> Result<DeviceUpdateMetadata, DeviceUpdateError> {
        let variant = match packet.payload_variant {
            Some(v) => v,
            None => {
                return Err(DeviceUpdateError::GeneralFailure(
                    "No payload variant".into(),
                ))
            }
        };

        let mut update_result = DeviceUpdateMetadata::new();

        match variant {
            protobufs::from_radio::PayloadVariant::Channel(channel) => {
                from_radio_handlers::handle_channel_packet(
                    &mut self.device,
                    &mut update_result,
                    channel,
                )?;
            }
            protobufs::from_radio::PayloadVariant::Config(config) => {
                from_radio_handlers::handle_config_packet(
                    &mut self.device,
                    &mut update_result,
                    config,
                )?;
            }
            protobufs::from_radio::PayloadVariant::ConfigCompleteId(_) => {
                from_radio_handlers::handle_config_complete_packet(
                    &mut self.device,
                    &mut update_result,
                )?;
            }
            protobufs::from_radio::PayloadVariant::LogRecord(_) => {
                return Err(DeviceUpdateError::RadioMessageNotSupported(
                    "log record".into(),
                ));
            }
            protobufs::from_radio::PayloadVariant::Metadata(_m) => {
                return Err(DeviceUpdateError::RadioMessageNotSupported(
                    "metadata".into(),
                ));
            }
            protobufs::from_radio::PayloadVariant::ModuleConfig(module_config) => {
                from_radio_handlers::handle_module_config_packet(
                    &mut self.device,
                    &mut update_result,
                    module_config,
                )?;
            }
            protobufs::from_radio::PayloadVariant::MyInfo(my_node_info) => {
                from_radio_handlers::handle_my_node_info_packet(
                    &mut self.device,
                    &mut update_result,
                    my_node_info,
                )?;
            }
            protobufs::from_radio::PayloadVariant::NodeInfo(node_info) => {
                from_radio_handlers::handle_node_info_packet(
                    &mut self.device,
                    &mut update_result,
                    node_info,
                )?;
            }
            protobufs::from_radio::PayloadVariant::Packet(mesh_packet) => {
                update_result = self.handle_mesh_packet(mesh_packet)?;
            }
            protobufs::from_radio::PayloadVariant::QueueStatus(_) => {
                return Err(DeviceUpdateError::RadioMessageNotSupported(
                    "queue status".into(),
                ));
            }
            protobufs::from_radio::PayloadVariant::Rebooted(_) => {
                update_result.rebooting = true;
            }
            protobufs::from_radio::PayloadVariant::XmodemPacket(_) => {
                return Err(DeviceUpdateError::RadioMessageNotSupported("xmodem".into()));
            }
            protobufs::from_radio::PayloadVariant::MqttClientProxyMessage(_) => {
                return Err(DeviceUpdateError::RadioMessageNotSupported(
                    "mqtt client proxy message".into(),
                ));
            }
        };

        Ok(update_result)
    }

    fn handle_mesh_packet(
        &mut self,
        packet: protobufs::MeshPacket,
    ) -> Result<DeviceUpdateMetadata, DeviceUpdateError> {
        let mut update_result = DeviceUpdateMetadata::new();
        let variant = packet
            .clone()
            .payload_variant
            .ok_or("No payload variant")
            .map_err(|e| DeviceUpdateError::GeneralFailure(e.to_string()))?;

        match variant {
            protobufs::mesh_packet::PayloadVariant::Decoded(data) => match data.portnum() {
                protobufs::PortNum::AdminApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("admin".into()));
                }
                protobufs::PortNum::AtakForwarder => {
                    return Err(DeviceUpdateError::PacketNotSupported(
                        "ATAK forwarder".into(),
                    ));
                }
                protobufs::PortNum::AudioApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("audio".into()));
                }
                protobufs::PortNum::IpTunnelApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("IP tunnel".into()));
                }
                protobufs::PortNum::NodeinfoApp => {
                    mesh_packet_handlers::handle_user_mesh_packet(
                        &mut self.device,
                        &mut update_result,
                        packet,
                        data,
                    )?;
                }
                protobufs::PortNum::PositionApp => {
                    mesh_packet_handlers::handle_position_mesh_packet(
                        &mut self.device,
                        &mut update_result,
                        packet,
                        data,
                    )?;
                }
                protobufs::PortNum::PrivateApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("admin".into()));
                }
                protobufs::PortNum::RangeTestApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("range test".into()));
                }
                protobufs::PortNum::RemoteHardwareApp => {
                    return Err(DeviceUpdateError::PacketNotSupported(
                        "remote hardware".into(),
                    ));
                }
                protobufs::PortNum::ReplyApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("reply".into()));
                }
                protobufs::PortNum::RoutingApp => {
                    mesh_packet_handlers::handle_routing_mesh_packet(
                        &mut self.device,
                        &mut update_result,
                        packet,
                        data,
                    )?;
                }
                protobufs::PortNum::SerialApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("serial".into()));
                }
                protobufs::PortNum::SimulatorApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("simulator".into()));
                }
                protobufs::PortNum::StoreForwardApp => {
                    return Err(DeviceUpdateError::PacketNotSupported(
                        "store-forward".into(),
                    ));
                }
                protobufs::PortNum::TelemetryApp => {
                    mesh_packet_handlers::handle_telemetry_mesh_packet(
                        &mut self.device,
                        &mut update_result,
                        packet,
                        data,
                    )?;
                }
                protobufs::PortNum::TextMessageApp => {
                    mesh_packet_handlers::handle_text_message_mesh_packet(
                        &mut self.device,
                        &mut update_result,
                        packet,
                        data,
                    )?;
                }
                protobufs::PortNum::TextMessageCompressedApp => {
                    return Err(DeviceUpdateError::PacketNotSupported(
                        "compressed text".into(),
                    ));
                }
                protobufs::PortNum::WaypointApp => {
                    mesh_packet_handlers::handle_waypoint_mesh_packet(
                        &mut self.device,
                        &mut update_result,
                        packet,
                        data,
                    )?;
                }
                protobufs::PortNum::ZpsApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("ZPS".into()));
                }
                protobufs::PortNum::NeighborinfoApp => {
                    mesh_packet_handlers::handle_neighbor_info_mesh_packet(
                        &mut self.device,
                        &mut update_result,
                        packet,
                        data,
                    )?;
                }
                protobufs::PortNum::TracerouteApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("traceroute".into()));
                }
                protobufs::PortNum::DetectionSensorApp => {
                    return Err(DeviceUpdateError::PacketNotSupported(
                        "detection sensor".into(),
                    ));
                }
                protobufs::PortNum::UnknownApp => {
                    return Err(DeviceUpdateError::GeneralFailure(
                        "Received UNKNOWN application packet".into(),
                    ));
                }
                protobufs::PortNum::Max => {
                    return Err(DeviceUpdateError::GeneralFailure(
                        "Received packet on portnum MAX".into(),
                    ));
                }
            },
            protobufs::mesh_packet::PayloadVariant::Encrypted(_e) => {
                return Err(DeviceUpdateError::PacketNotSupported("encrypted".into()));
            }
        }

        Ok(update_result)
    }
}
