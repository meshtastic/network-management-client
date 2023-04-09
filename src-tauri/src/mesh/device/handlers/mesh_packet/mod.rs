mod handlers;

use super::{super::MeshDevice, DeviceUpdateError, DeviceUpdateMetadata};
use app::protobufs;

impl MeshDevice {
    pub fn handle_mesh_packet(
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
                    handlers::handle_user_mesh_packet(self, &mut update_result, packet, data)?;
                }
                protobufs::PortNum::PositionApp => {
                    handlers::handle_position_mesh_packet(self, &mut update_result, packet, data)?;
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
                    handlers::handle_routing_mesh_packet(self, &mut update_result, packet, data)?;
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
                    handlers::handle_telemetry_mesh_packet(self, &mut update_result, packet, data)?;
                }
                protobufs::PortNum::TextMessageApp => {
                    handlers::handle_text_message_mesh_packet(
                        self,
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
                    handlers::handle_waypoint_mesh_packet(self, &mut update_result, packet, data)?;
                }
                protobufs::PortNum::ZpsApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("ZPS".into()));
                }
                protobufs::PortNum::NeighborinfoApp => {
                    handlers::handle_neighbor_info_mesh_packet(
                        self,
                        &mut update_result,
                        packet,
                        data,
                    )?;
                }
                protobufs::PortNum::TracerouteApp => {
                    return Err(DeviceUpdateError::PacketNotSupported("traceroute".into()));
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

#[cfg(test)]
mod tests {
    // use crate::mesh;

    // use super::*;

    // fn initialize_mock_device() -> mesh::device::MeshDevice {
    //     mesh::device::MeshDevice::new()
    // }

    #[test]
    fn node_info_app() {}
    #[test]
    fn position_app() {}
    #[test]
    fn routing_app_ack() {}
    #[test]
    fn routing_app_error() {}
    #[test]
    fn telemetry_app() {}
    #[test]
    fn text_message_app() {}
    #[test]
    fn waypoint_app() {}
    #[test]
    fn neighbor_info_app() {}
}
