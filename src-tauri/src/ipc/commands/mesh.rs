use crate::ipc::CommandError;
use crate::state;
use crate::{device::connections::PacketDestination, ipc::events};

use app::protobufs;
use log::{debug, trace};

#[tauri::command]
pub async fn send_text(
    port_name: String,
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
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
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
    port_name: String,
    waypoint: protobufs::Waypoint,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called send_waypoint command");
    trace!("Called on channel {} with waypoint {:?}", channel, waypoint);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
        .ok_or("Radio connection not initialized")?;

    connection
        .send_waypoint(
            device,
            waypoint,
            PacketDestination::Broadcast,
            true,
            channel,
        )
        .await?;

    events::dispatch_updated_device(&app_handle, device).map_err(|e| e.to_string())?;

    Ok(())
}
