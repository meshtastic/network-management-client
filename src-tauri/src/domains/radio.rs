use crate::api::contracts::radio::{
    CommitConfigurationTransactionRequest, CommitConfigurationTransactionResponse,
    StartConfigurationTransactionRequest, StartConfigurationTransactionResponse,
    UpdateDeviceConfigBulkRequest, UpdateDeviceConfigBulkResponse, UpdateDeviceConfigRequest,
    UpdateDeviceConfigResponse, UpdateDeviceUserRequest, UpdateDeviceUserResponse,
};
use crate::ipc::{events, CommandError};
use crate::state;

use log::trace;

pub async fn handle_update_device_config(
    request: UpdateDeviceConfigRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<UpdateDeviceConfigResponse, CommandError> {
    let UpdateDeviceConfigRequest { device_key, config } = request;
    trace!("Called with config {:?}", config);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection
        .update_config(packet_api, config)
        .await
        .map_err(|e| e.to_string())?;

    let response = UpdateDeviceConfigResponse {};
    Ok(response)
}

pub async fn handle_update_device_user(
    request: UpdateDeviceUserRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<UpdateDeviceUserResponse, CommandError> {
    let UpdateDeviceUserRequest { device_key, user } = request;
    trace!("Called with user {:?}", user);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection
        .update_user(packet_api, user)
        .await
        .map_err(|e| e.to_string())
        .map_err(|e| e.to_string())?;

    let response = UpdateDeviceUserResponse {};
    Ok(response)
}

pub async fn handle_start_configuration_transaction(
    request: StartConfigurationTransactionRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<StartConfigurationTransactionResponse, CommandError> {
    let StartConfigurationTransactionRequest { device_key } = request;

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    if packet_api.device.config_in_progress {
        return Err("Configuration transaction already started".into());
    }

    connection
        .start_config_transaction()
        .await
        .map_err(|e| e.to_string())?;

    packet_api.device.config_in_progress = true;

    let response = StartConfigurationTransactionResponse {};
    Ok(response)
}

pub async fn handle_commit_configuration_transaction(
    request: CommitConfigurationTransactionRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<CommitConfigurationTransactionResponse, CommandError> {
    let CommitConfigurationTransactionRequest { device_key } = request;

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    if !packet_api.device.config_in_progress {
        return Err("Configuration transaction not started".into());
    }

    connection
        .commit_config_transaction()
        .await
        .map_err(|e| e.to_string())?;

    packet_api.device.config_in_progress = false;

    let response = CommitConfigurationTransactionResponse {};
    Ok(response)
}

pub async fn handle_update_device_config_bulk(
    request: UpdateDeviceConfigBulkRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<UpdateDeviceConfigBulkResponse, CommandError> {
    let UpdateDeviceConfigBulkRequest { device_key, config } = request;

    let mut devices_guard = mesh_devices.inner.lock().await;
    let packet_api = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection
        .start_config_transaction()
        .await
        .map_err(|e| e.to_string())?;

    if let Some(radio_config) = config.radio {
        connection
            .set_local_config(packet_api, radio_config)
            .await
            .map_err(|e| e.to_string())?;
    }

    if let Some(module_config) = config.module {
        connection
            .set_local_module_config(packet_api, module_config)
            .await
            .map_err(|e| e.to_string())?;
    }

    if let Some(channel_config) = config.channels {
        connection
            .set_message_channel_config(packet_api, channel_config)
            .await
            .map_err(|e| e.to_string())?;
    }

    connection
        .commit_config_transaction()
        .await
        .map_err(|e| e.to_string())?;

    events::dispatch_updated_device(&app_handle, &packet_api.device).map_err(|e| e.to_string())?;

    let response = UpdateDeviceConfigBulkResponse {};
    Ok(response)
}
