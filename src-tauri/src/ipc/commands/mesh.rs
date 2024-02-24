use crate::device::NormalizedWaypoint;
use crate::ipc::events;
use crate::ipc::CommandError;
use crate::state::{self, DeviceKey};

use log::{debug, trace};
use meshtastic::connections::PacketDestination;

#[tauri::command]
pub async fn send_text(
    device_key: DeviceKey,
    text: String,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<(), CommandError> {
    debug!("Called send_text command",);
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
            channel,
        )
        .await?;

    events::dispatch_updated_device(&app_handle, &packet_api.device).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn send_waypoint(
    device_key: DeviceKey,
    waypoint: NormalizedWaypoint,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<(), CommandError> {
    debug!("Called send_waypoint command");
    trace!("Called on channel {} with waypoint {:?}", channel, waypoint);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection
        .send_waypoint(
            packet_api,
            waypoint.into(),
            PacketDestination::Broadcast,
            true,
            channel,
        )
        .await?;

    events::dispatch_updated_device(&app_handle, &packet_api.device).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_waypoint(
    device_key: DeviceKey,
    waypoint_id: u32,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
) -> Result<(), CommandError> {
    debug!("Called delete_waypoint command");

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    if packet_api.device.waypoints.contains_key(&waypoint_id) {
        let _removed_waypoint = packet_api.device.waypoints.remove(&waypoint_id);
    }

    events::dispatch_updated_device(&app_handle, &packet_api.device).map_err(|e| e.to_string())?;

    Ok(())
}
