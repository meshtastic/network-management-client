use crate::api::contracts::radio::{
    CommitConfigurationTransactionRequest, CommitConfigurationTransactionResponse,
    StartConfigurationTransactionRequest, StartConfigurationTransactionResponse,
    UpdateDeviceConfigBulkRequest, UpdateDeviceConfigBulkResponse, UpdateDeviceConfigRequest,
    UpdateDeviceConfigResponse, UpdateDeviceUserRequest, UpdateDeviceUserResponse,
};
use crate::domains::radio::{
    handle_commit_configuration_transaction, handle_start_configuration_transaction,
    handle_update_device_config, handle_update_device_config_bulk, handle_update_device_user,
};
use crate::ipc::CommandError;
use crate::state;

use log::debug;

#[tauri::command]
pub async fn update_device_config(
    request: UpdateDeviceConfigRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<UpdateDeviceConfigResponse, CommandError> {
    debug!("Called update_device_config command");
    let response = handle_update_device_config(request, mesh_devices, radio_connections).await?;
    Ok(response)
}

#[tauri::command]
pub async fn update_device_user(
    request: UpdateDeviceUserRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<UpdateDeviceUserResponse, CommandError> {
    debug!("Called update_device_user command");
    let response = handle_update_device_user(request, mesh_devices, radio_connections).await?;
    Ok(response)
}

// UNUSED
#[tauri::command]
pub async fn start_configuration_transaction(
    request: StartConfigurationTransactionRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<StartConfigurationTransactionResponse, CommandError> {
    debug!("Called start_configuration_transaction command");
    let response =
        handle_start_configuration_transaction(request, mesh_devices, radio_connections).await?;
    Ok(response)
}

// UNUSED
#[tauri::command]
pub async fn commit_configuration_transaction(
    request: CommitConfigurationTransactionRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<CommitConfigurationTransactionResponse, CommandError> {
    debug!("Called commit_configuration_transaction command");
    let response =
        handle_commit_configuration_transaction(request, mesh_devices, radio_connections).await?;
    Ok(response)
}

#[tauri::command]
pub async fn update_device_config_bulk(
    request: UpdateDeviceConfigBulkRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<UpdateDeviceConfigBulkResponse, CommandError> {
    debug!("Called update_device_config_bulk command");
    let response =
        handle_update_device_config_bulk(request, app_handle, mesh_devices, radio_connections)
            .await?;
    Ok(response)
}
