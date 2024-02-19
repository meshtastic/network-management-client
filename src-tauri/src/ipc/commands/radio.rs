use crate::ipc::events;
use crate::ipc::CommandError;
use crate::ipc::DeviceBulkConfig;
use crate::state;
use crate::state::DeviceKey;

use log::debug;
use log::trace;
use meshtastic::protobufs;

#[tauri::command]
pub async fn update_device_config(
    device_key: DeviceKey,
    config: protobufs::Config,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called update_device_config command");
    trace!("Called with config {:?}", config);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection.update_config(device, config).await?;

    Ok(())
}

#[tauri::command]
pub async fn update_device_user(
    device_key: DeviceKey,
    user: protobufs::User,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called update_device_user command");
    trace!("Called with user {:?}", user);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection.update_user(device, user).await?;

    Ok(())
}

// UNUSED
#[tauri::command]
pub async fn start_configuration_transaction(
    device_key: DeviceKey,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called start_configuration_transaction command");

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    if device.config_in_progress {
        return Err("Configuration transaction already started".into());
    }

    connection.start_config_transaction().await?;
    device.config_in_progress = true;

    Ok(())
}

// UNUSED
#[tauri::command]
pub async fn commit_configuration_transaction(
    device_key: DeviceKey,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called commit_configuration_transaction command");

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    if !device.config_in_progress {
        return Err("Configuration transaction not started".into());
    }

    connection.commit_config_transaction().await?;
    device.config_in_progress = false;

    Ok(())
}

#[tauri::command]
pub async fn update_device_config_bulk(
    device_key: DeviceKey,
    app_handle: tauri::AppHandle,
    config: DeviceBulkConfig,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called commit_configuration_transaction command");

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&device_key)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&device_key)
        .ok_or("Radio connection not initialized")?;

    connection.start_config_transaction().await?;

    if let Some(radio_config) = config.radio {
        connection.set_local_config(device, radio_config).await?;
    }

    if let Some(module_config) = config.module {
        connection
            .set_local_module_config(device, module_config)
            .await?;
    }

    if let Some(channel_config) = config.channels {
        connection
            .set_message_channel_config(device, channel_config)
            .await?;
    }

    connection.commit_config_transaction().await?;

    events::dispatch_updated_device(&app_handle, device).map_err(|e| e.to_string())?;

    Ok(())
}
