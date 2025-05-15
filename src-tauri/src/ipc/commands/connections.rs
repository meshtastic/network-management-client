use crate::device;
use crate::device::SerialDeviceStatus;
use crate::ipc::helpers::spawn_configuration_timeout_handler;
use crate::ipc::helpers::spawn_decoded_handler;
use crate::ipc::CommandError;
use crate::packet_api::MeshPacketApi;
use crate::state;
use crate::state::DeviceKey;

use log::debug;
use meshtastic::api::{StreamApi, StreamHandle};
use meshtastic::utils::stream::build_serial_stream;
use meshtastic::utils::stream::build_tcp_stream;
use std::time::Duration;
use tauri::Manager;
use tokio::io::AsyncReadExt;
use tokio::io::AsyncWriteExt;

#[tauri::command]
pub async fn request_autoconnect_port(
    autoconnect_state: tauri::State<'_, state::autoconnect::AutoConnectState>,
) -> Result<String, CommandError> {
    debug!("Called request_autoconnect_port command");

    let autoconnect_port_guard = autoconnect_state.inner.lock().await;
    let autoconnect_port = autoconnect_port_guard
        .as_ref()
        .ok_or("Autoconnect port state not initialized")?
        .clone();

    debug!("Returning autoconnect port {:?}", autoconnect_port);

    Ok(autoconnect_port)
}

#[tauri::command]
pub fn get_all_serial_ports() -> Result<Vec<String>, CommandError> {
    debug!("Called get_all_serial_ports command");

    let ports = tokio_serial::available_ports()
        .map_err(|e| format!("Error getting availabled serial ports: {:?}", e))?
        .iter()
        .map(|port| port.port_name.clone())
        .collect();

    Ok(ports)
}

async fn create_new_connection<S>(
    stream: StreamHandle<S>,
    device_key: DeviceKey,
    timeout_duration: Duration,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<(), CommandError>
where
    S: AsyncReadExt + AsyncWriteExt + Send + 'static,
{
    // Initialize device and StreamApi instances

    let device = device::MeshDevice::new();
    let mut packet_api = MeshPacketApi::new(
        app_handle.clone(),
        device_key.clone(),
        device,
        mesh_graph.inner.clone(),
    );

    let stream_api = StreamApi::new();

    // Connect to device via stream API

    packet_api.device.set_status(SerialDeviceStatus::Connecting);
    let (decoded_listener, stream_api) = stream_api.connect(stream).await;

    // Configure device via stream API

    packet_api
        .device
        .set_status(SerialDeviceStatus::Configuring);

    let stream_api = stream_api
        .configure(packet_api.device.config_id)
        .await
        .map_err(|e| e.to_string())?;

    // Persist connection in Tauri state

    let handle = app_handle.clone();
    let mesh_devices_arc = mesh_devices.inner.clone();
    let radio_connections_arc = radio_connections.inner.clone();

    // Persist device struct in Tauri state
    {
        let mut devices_guard = mesh_devices_arc.lock().await;
        devices_guard.insert(device_key.clone(), packet_api);
    }

    // Persist StreamApi instance Tauri state
    {
        let mut connections_guard = radio_connections_arc.lock().await;
        connections_guard.insert(device_key.clone(), stream_api);
    }

    // Spawn timeout handler to catch invlaid device connections
    // Needs the device struct and port name to be loaded into Tauri state before running

    spawn_configuration_timeout_handler(
        handle.clone(),
        mesh_devices_arc.clone(),
        device_key.clone(),
        timeout_duration,
    );

    // Spawn decoded packet handler to route decoded packets

    spawn_decoded_handler(decoded_listener, mesh_devices_arc, device_key);

    Ok(())
}

#[tauri::command]
pub async fn connect_to_serial_port(
    port_name: String,
    baud_rate: Option<u32>,
    dtr: Option<bool>,
    rts: Option<bool>,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<(), CommandError> {
    debug!(
        "Called connect_to_serial_port command with port \"{}\"",
        port_name
    );

    // Create serial connection stream

    let stream =
        build_serial_stream(port_name.clone(), baud_rate, dtr, rts).map_err(|e| e.to_string())?;

    // Create and persist new connection

    create_new_connection(
        stream,
        port_name,
        Duration::from_millis(15000),
        app_handle,
        mesh_devices,
        radio_connections,
        mesh_graph,
    )
    .await?;

    Ok(())
}

#[tauri::command]
pub async fn connect_to_tcp_port(
    address: String,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<(), CommandError> {
    debug!(
        "Called connect_to_tcp_port command with address \"{}\"",
        address
    );

    // Create TCP connection stream

    let stream = build_tcp_stream(address.clone())
        .await
        .map_err(|e| e.to_string())?;

    // Create and persist new connection

    create_new_connection(
        stream,
        address,
        Duration::from_millis(15000),
        app_handle,
        mesh_devices,
        radio_connections,
        mesh_graph,
    )
    .await?;

    Ok(())
}

#[tauri::command]
pub async fn drop_device_connection(
    device_key: DeviceKey,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<(), CommandError> {
    debug!("Called drop_device_connection command");

    {
        let mut state_devices = mesh_devices.inner.lock().await;
        let mut connections_guard = radio_connections.inner.lock().await;

        // Disconnect from open connection
        // TODO abstract this clearing into a helper function

        if let Some(stream_api) = connections_guard.remove(&device_key) {
            match stream_api.disconnect().await {
                Ok(_) => (),
                Err(e) => {
                    debug!("Failed to disconnect from device: {:?}", e);
                }
            };
        }

        // Clear corresponding state device

        if let Some(packet_api) = state_devices.get_mut(&device_key) {
            packet_api
                .device
                .set_status(SerialDeviceStatus::Disconnected);
        }

        state_devices.remove(&device_key);
    }

    Ok(())
}

#[tauri::command]
pub async fn drop_all_device_connections(
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<(), CommandError> {
    debug!("Called drop_all_device_connections command");

    {
        let mut connections_guard = radio_connections.inner.lock().await;

        // Disconnect from all open connections and empty HashMap

        for (_, connection) in connections_guard.drain() {
            connection.disconnect().await.map_err(|e| e.to_string())?;
        }

        // Set all state devices as disconnected and empty HashMap

        let mut state_devices = mesh_devices.inner.lock().await;

        for (_port_name, packet_api) in state_devices.iter_mut() {
            packet_api
                .device
                .set_status(SerialDeviceStatus::Disconnected);
        }

        // This could be removed in the future to maintain state on previous devices
        state_devices.clear();
    }

    Ok(())
}
