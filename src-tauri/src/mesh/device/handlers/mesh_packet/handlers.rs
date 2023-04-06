use app::protobufs;
use log::debug;

use crate::mesh::device::{
    handlers::{DeviceUpdateError, DeviceUpdateMetadata, NotificationConfig},
    helpers::{get_channel_name, get_node_user_name},
    ChannelMessageState, MeshDevice, NeighborInfoPacket, PositionPacket, TelemetryPacket,
    TextPacket, UserPacket, WaypointPacket,
};
use prost::Message;

pub fn handle_user_mesh_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::User::decode(data.payload.as_slice())
        .map_err(DeviceUpdateError::DecodeFailure)?;

    device.add_user(UserPacket { packet, data });

    update_result.device_updated = true;

    Ok(())
}

pub fn handle_position_mesh_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::Position::decode(data.payload.as_slice())
        .map_err(DeviceUpdateError::DecodeFailure)?;

    device.add_position(PositionPacket { packet, data });

    update_result.device_updated = true;
    update_result.regenerate_graph = true;

    Ok(())
}

pub fn handle_routing_mesh_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let routing_data = protobufs::Routing::decode(data.payload.as_slice())
        .map_err(DeviceUpdateError::DecodeFailure)?;

    if let Some(variant) = routing_data.variant {
        match variant {
            protobufs::routing::Variant::ErrorReason(e) => {
                if let Some(r) = protobufs::routing::Error::from_i32(e) {
                    match r {
                        protobufs::routing::Error::None => {
                            device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Acknowledged,
                            );
                        }
                        protobufs::routing::Error::Timeout => {
                            device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Message timed out".into()),
                            );
                        }
                        protobufs::routing::Error::MaxRetransmit => {
                            device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Reached retransmit limit".into()),
                            );
                        }
                        protobufs::routing::Error::GotNak => {
                            device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Received NAK".into()),
                            );
                        }
                        protobufs::routing::Error::TooLarge => {
                            device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Message too large".into()),
                            );
                        }
                        _ => {
                            device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Message failed to send".into()),
                            );
                        }
                    }

                    update_result.device_updated = true;
                }
            }
            protobufs::routing::Variant::RouteReply(r) => {
                debug!("Route reply: {:?}", r);
            }
            protobufs::routing::Variant::RouteRequest(r) => {
                debug!("Route request: {:?}", r);
            }
        }
    }

    Ok(())
}

pub fn handle_telemetry_mesh_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::Telemetry::decode(data.payload.as_slice())
        .map_err(DeviceUpdateError::DecodeFailure)?;

    device.set_device_metrics(TelemetryPacket { packet, data });

    update_result.device_updated = true;

    Ok(())
}

pub fn handle_text_message_mesh_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = String::from_utf8(data.payload)
        .map_err(|e| DeviceUpdateError::GeneralFailure(e.to_string()))?;

    device.add_text_message(TextPacket {
        packet: packet.clone(),
        data: data.clone(),
    });

    let from_user_name =
        get_node_user_name(device, &packet.from).unwrap_or_else(|| packet.from.to_string());

    let channel_name =
        get_channel_name(device, &packet.channel).unwrap_or_else(|| "Unknown channel".into());

    let mut notification = NotificationConfig::new();
    notification.title = format!("{} in {}", from_user_name, channel_name);
    notification.body = data;

    // Always keep updates at bottom in case of failure during functions
    update_result.device_updated = true;
    update_result.notification_config = Some(notification);

    Ok(())
}

pub fn handle_waypoint_mesh_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::Waypoint::decode(data.payload.as_slice())
        .map_err(DeviceUpdateError::DecodeFailure)?;

    device.add_waypoint(data.clone());
    device.add_waypoint_message(WaypointPacket {
        packet: packet.clone(),
        data: data.clone(),
    });

    let from_user_name =
        get_node_user_name(device, &packet.from).unwrap_or_else(|| packet.from.to_string());

    let channel_name =
        get_channel_name(device, &packet.channel).unwrap_or_else(|| "Unknown channel".into());

    let mut notification = NotificationConfig::new();
    notification.title = format!("{} in {}", from_user_name, channel_name);
    notification.body = format!(
        "Sent waypoint \"{}\" at {}, {}",
        data.name,
        data.latitude_i as f32 / 1e7,
        data.longitude_i as f32 / 1e7
    );

    update_result.device_updated = true;
    update_result.notification_config = Some(notification);

    Ok(())
}

pub fn handle_neighbor_info_mesh_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::NeighborInfo::decode(data.payload.as_slice())
        .map_err(DeviceUpdateError::DecodeFailure)?;

    device.add_neighborinfo(NeighborInfoPacket { packet, data });

    update_result.device_updated = true;
    update_result.regenerate_graph = true;

    Ok(())
}

#[cfg(test)]
mod tests {
    // * Integration test converage within `mod.rs`
}
