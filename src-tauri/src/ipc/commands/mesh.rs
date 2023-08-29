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
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called send_text command",);
    trace!("Called with text {} on channel {}", text, channel);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection
        .send_text(
            device,
            text.clone(),
            PacketDestination::Broadcast,
            true,
            channel,
        )
        .await?;

    events::dispatch_updated_device(&app_handle, device).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn send_waypoint(
    device_key: DeviceKey,
    waypoint: NormalizedWaypoint,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called send_waypoint command");
    trace!("Called on channel {} with waypoint {:?}", channel, waypoint);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection
        .send_waypoint(
            device,
            waypoint.into(),
            PacketDestination::Broadcast,
            true,
            channel,
        )
        .await?;

    events::dispatch_updated_device(&app_handle, device).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_waypoint(
    device_key: DeviceKey,
    waypoint_id: u32,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
) -> Result<(), CommandError> {
    debug!("Called delete_waypoint command");

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    if device.waypoints.contains_key(&waypoint_id) {
        let _removed_waypoint = device.waypoints.remove(&waypoint_id);
    }

    events::dispatch_updated_device(&app_handle, device).map_err(|e| e.to_string())?;

    Ok(())
}
