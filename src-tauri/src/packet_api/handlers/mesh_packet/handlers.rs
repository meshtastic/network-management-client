use log::debug;
use meshtastic::protobufs;
use tauri::api::notification::Notification;

use crate::{
    device::{
        helpers::{get_channel_name, get_node_user_name},
        ChannelMessageState, NeighborInfoPacket, NormalizedWaypoint, PositionPacket,
        TelemetryPacket, TextPacket, UserPacket, WaypointPacket,
    },
    ipc::events,
    packet_api::{handlers::DeviceUpdateError, MeshPacketApi},
};
use meshtastic::Message;

pub fn handle_user_mesh_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::User::decode(data.payload.as_slice())
        .map_err(|e| DeviceUpdateError::DecodeFailure(e.to_string()))?;

    packet_api.device.add_user(UserPacket { packet, data });

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::DispatchError(e.to_string()))?;

    Ok(())
}

pub fn handle_position_mesh_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::Position::decode(data.payload.as_slice())
        .map_err(|e| DeviceUpdateError::DecodeFailure(e.to_string()))?;

    packet_api
        .device
        .add_position(PositionPacket { packet, data });

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::DispatchError(e.to_string()))?;

    log::warn!("Graph regeneration not implemented");

    Ok(())
}

pub fn handle_routing_mesh_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let routing_data = protobufs::Routing::decode(data.payload.as_slice())
        .map_err(|e| DeviceUpdateError::DecodeFailure(e.to_string()))?;

    if let Some(variant) = routing_data.variant {
        match variant {
            protobufs::routing::Variant::ErrorReason(e) => {
                if let Some(r) = protobufs::routing::Error::from_i32(e) {
                    match r {
                        protobufs::routing::Error::None => {
                            packet_api.device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Acknowledged,
                            );
                        }
                        protobufs::routing::Error::Timeout => {
                            packet_api.device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Message timed out".into()),
                            );
                        }
                        protobufs::routing::Error::MaxRetransmit => {
                            packet_api.device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Reached retransmit limit".into()),
                            );
                        }
                        protobufs::routing::Error::GotNak => {
                            packet_api.device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Received NAK".into()),
                            );
                        }
                        protobufs::routing::Error::TooLarge => {
                            packet_api.device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Message too large".into()),
                            );
                        }
                        _ => {
                            packet_api.device.set_message_state(
                                packet.channel,
                                data.request_id,
                                ChannelMessageState::Error("Message failed to send".into()),
                            );
                        }
                    }

                    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
                        .map_err(|e| DeviceUpdateError::DispatchError(e.to_string()))?;
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

pub fn handle_telemetry_mesh_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::Telemetry::decode(data.payload.as_slice())
        .map_err(|e| DeviceUpdateError::DecodeFailure(e.to_string()))?;

    packet_api
        .device
        .set_device_metrics(TelemetryPacket { packet, data });

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::DispatchError(e.to_string()))?;

    Ok(())
}

pub fn handle_text_message_mesh_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = String::from_utf8(data.payload)
        .map_err(|e| DeviceUpdateError::GeneralFailure(e.to_string()))?;

    packet_api.device.add_text_message(TextPacket {
        packet: packet.clone(),
        data: data.clone(),
    });

    let from_user_name = get_node_user_name(&mut packet_api.device, &packet.from)
        .unwrap_or_else(|| packet.from.to_string());

    let channel_name = get_channel_name(&mut packet_api.device, &packet.channel)
        .unwrap_or_else(|| "Unknown channel".into());

    // Always keep updates at bottom in case of failure during functions
    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::DispatchError(e.to_string()))?;

    Notification::new(
        packet_api
            .app_handle
            .config()
            .tauri
            .bundle
            .identifier
            .clone(),
    )
    .title(format!("{} in {}", from_user_name, channel_name))
    .body(data)
    .notify(&packet_api.app_handle)
    .map_err(|e| DeviceUpdateError::NotificationError(e.to_string()))?;

    Ok(())
}

pub fn handle_waypoint_mesh_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::Waypoint::decode(data.payload.as_slice())
        .map_err(|e| DeviceUpdateError::DecodeFailure(e.to_string()))?;

    let converted_data: NormalizedWaypoint = data.into();

    packet_api.device.add_waypoint(converted_data.clone());
    packet_api.device.add_waypoint_message(WaypointPacket {
        packet: packet.clone(),
        data: converted_data.clone(),
    });

    let from_user_name = get_node_user_name(&mut packet_api.device, &packet.from)
        .unwrap_or_else(|| packet.from.to_string());

    let channel_name = get_channel_name(&mut packet_api.device, &packet.channel)
        .unwrap_or_else(|| "Unknown channel".into());

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::DispatchError(e.to_string()))?;

    Notification::new(
        packet_api
            .app_handle
            .config()
            .tauri
            .bundle
            .identifier
            .clone(),
    )
    .title(format!("{} in {}", from_user_name, channel_name))
    .body(format!(
        "Sent waypoint \"{}\" at {}, {}",
        converted_data.name, converted_data.latitude, converted_data.longitude
    ))
    .notify(&packet_api.app_handle)
    .map_err(|e| DeviceUpdateError::NotificationError(e.to_string()))?;

    Ok(())
}

pub fn handle_neighbor_info_mesh_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    packet: protobufs::MeshPacket,
    data: protobufs::Data,
) -> Result<(), DeviceUpdateError> {
    let data = protobufs::NeighborInfo::decode(data.payload.as_slice())
        .map_err(|e| DeviceUpdateError::DecodeFailure(e.to_string()))?;

    packet_api
        .device
        .add_neighborinfo(NeighborInfoPacket { packet, data });

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::DispatchError(e.to_string()))?;

    log::warn!("Graph regeneration not implemented");

    Ok(())
}

#[cfg(test)]
mod tests {
    // * Integration test converage within `mod.rs`
}
