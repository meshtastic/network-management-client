use crate::api::contracts::mesh::{
    DeleteWaypointRequest, DeleteWaypointResponse, SendTextRequest, SendTextResponse,
    SendWaypointRequest, SendWaypointResponse,
};
use crate::domains::mesh::{handle_delete_waypoint, handle_send_text, handle_send_waypoint};
use crate::ipc::CommandError;
use crate::state;

use log::debug;

#[tauri::command]
pub async fn send_text(
    request: SendTextRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<SendTextResponse, CommandError> {
    debug!("Called send_text command",);
    let response = handle_send_text(request, app_handle, mesh_devices, radio_connections).await?;
    Ok(response)
}

#[tauri::command]
pub async fn send_waypoint(
    request: SendWaypointRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<SendWaypointResponse, CommandError> {
    debug!("Called send_waypoint command");
    let response =
        handle_send_waypoint(request, app_handle, mesh_devices, radio_connections).await?;
    Ok(response)
}

#[tauri::command]
pub async fn delete_waypoint(
    request: DeleteWaypointRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
) -> Result<DeleteWaypointResponse, CommandError> {
    debug!("Called delete_waypoint command");
    let response = handle_delete_waypoint(request, app_handle, mesh_devices).await?;
    Ok(response)
}
