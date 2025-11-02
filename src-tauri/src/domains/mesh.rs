use crate::api::contracts::mesh::DeleteWaypointRequest;
use crate::api::contracts::mesh::DeleteWaypointResponse;
use crate::api::contracts::mesh::SendTextRequest;
use crate::api::contracts::mesh::SendTextResponse;
use crate::api::contracts::mesh::SendWaypointRequest;
use crate::api::contracts::mesh::SendWaypointResponse;
use crate::device::helpers::convert_location_field_to_protos;
use crate::ipc::events;
use crate::ipc::CommandError;
use crate::state;

use log::trace;
use meshtastic::packet::PacketDestination;
use meshtastic::protobufs;
use meshtastic::types::MeshChannel;

pub async fn handle_send_text(
    request: SendTextRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<SendTextResponse, CommandError> {
    let SendTextRequest {
        device_key,
        text,
        channel,
    } = request;
    trace!("Called with text {} on channel {}", text, channel);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection
        .send_text(
            packet_api,
            text.clone(),
            PacketDestination::Broadcast,
            true,
            MeshChannel::new(channel).map_err(|e| e.to_string())?,
        )
        .await
        .map_err(|e| e.to_string())?;

    events::dispatch_updated_device(&app_handle, &packet_api.device).map_err(|e| e.to_string())?;

    let response = SendTextResponse {};
    Ok(response)
}

pub async fn handle_send_waypoint(
    request: SendWaypointRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<SendWaypointResponse, CommandError> {
    let SendWaypointRequest {
        device_key,
        waypoint,
        channel,
    } = request;
    trace!("Called on channel {} with waypoint {:?}", channel, waypoint);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    let waypoint_proto = protobufs::Waypoint {
        id: waypoint.id,
        // Converting to f64 first to cover entire i32 range
        latitude_i: Some(convert_location_field_to_protos(waypoint.latitude)),
        longitude_i: Some(convert_location_field_to_protos(waypoint.longitude)),
        expire: waypoint.expire,
        locked_to: waypoint.locked_to,
        name: waypoint.name,
        description: waypoint.description,
        icon: waypoint.icon,
    };

    connection
        .send_waypoint(
            packet_api,
            waypoint_proto,
            PacketDestination::Broadcast,
            true,
            MeshChannel::new(channel).map_err(|e| e.to_string())?,
        )
        .await
        .map_err(|e| e.to_string())?;

    events::dispatch_updated_device(&app_handle, &packet_api.device).map_err(|e| e.to_string())?;

    let response = SendWaypointResponse {};
    Ok(response)
}

pub async fn handle_delete_waypoint(
    request: DeleteWaypointRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
) -> Result<DeleteWaypointResponse, CommandError> {
    let DeleteWaypointRequest {
        device_key,
        waypoint_id,
    } = request;

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    if packet_api.device.waypoints.contains_key(&waypoint_id) {
        let _removed_waypoint = packet_api.device.waypoints.remove(&waypoint_id);
    }

    events::dispatch_updated_device(&app_handle, &packet_api.device).map_err(|e| e.to_string())?;

    let response = DeleteWaypointResponse {};
    Ok(response)
}
