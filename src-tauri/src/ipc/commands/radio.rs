use crate::ipc::events;
use crate::ipc::CommandError;
use crate::ipc::DeviceBulkConfig;
use crate::state;

use app::protobufs;
use log::debug;
use log::trace;

#[tauri::command]
pub async fn update_device_config(
    port_name: String,
    config: protobufs::Config,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called update_device_config command");
    trace!("Called with config {:?}", config);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
        .ok_or("Radio connection not initialized")?;

    connection.update_device_config(device, config).await?;

    Ok(())
}

#[tauri::command]
pub async fn update_device_user(
    port_name: String,
    user: protobufs::User,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called update_device_user command");
    trace!("Called with user {:?}", user);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
        .ok_or("Radio connection not initialized")?;

    connection.update_device_user(device, user).await?;

    Ok(())
}

#[tauri::command]
pub async fn start_configuration_transaction(
    port_name: String,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called start_configuration_transaction command");

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
        .ok_or("Radio connection not initialized")?;

    connection.start_configuration_transaction(device).await?;

    Ok(())
}

// UNUSED
#[tauri::command]
pub async fn commit_configuration_transaction(
    port_name: String,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called commit_configuration_transaction command");

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
        .ok_or("Radio connection not initialized")?;

    connection.commit_configuration_transaction(device).await?;

    Ok(())
}

#[tauri::command]
pub async fn update_device_config_bulk(
    port_name: String,
    app_handle: tauri::AppHandle,
    config: DeviceBulkConfig,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called commit_configuration_transaction command");

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
        .ok_or("Radio connection not initialized")?;

    connection.start_configuration_transaction(device).await?;

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
            .set_channel_config(device, channel_config)
            .await?;
    }

    connection.commit_configuration_transaction(device).await?;

    events::dispatch_updated_device(&app_handle, device).map_err(|e| e.to_string())?;

    Ok(())
}
