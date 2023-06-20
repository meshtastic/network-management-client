use crate::device;
use crate::device::connections;
use crate::device::connections::serial::SerialConnection;
use crate::device::connections::MeshConnection;
use crate::device::SerialDeviceStatus;
use crate::ipc::helpers::initialize_serial_connection_handlers;
use crate::ipc::helpers::spawn_configuration_timeout_handler;
use crate::ipc::helpers::spawn_decoded_handler;
use crate::ipc::CommandError;
use crate::state;

use log::debug;
use std::time::Duration;

#[tauri::command]
pub async fn request_autoconnect_port(
    autoconnect_state: tauri::State<'_, state::AutoConnectState>,
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
    let ports = SerialConnection::get_available_ports()?;
    Ok(ports)
}

#[tauri::command]
pub async fn connect_to_serial_port(
    port_name: String,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
) -> Result<(), CommandError> {
    debug!(
        "Called connect_to_serial_port command with port \"{}\"",
        port_name
    );

    initialize_serial_connection_handlers(
        port_name,
        app_handle,
        mesh_devices,
        radio_connections,
        mesh_graph,
    )
    .await
}

#[tauri::command]
pub async fn connect_to_tcp_port(
    address: String,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
) -> Result<(), CommandError> {
    debug!(
        "Called connect_to_tcp_port command with address \"{}\"",
        address
    );

    let mut connection = connections::tcp::TcpConnection::new();
    let mut device = device::MeshDevice::new();

    device.set_status(SerialDeviceStatus::Connecting);

    // Ensure TCP connection is established
    match connection.connect(address.clone()).await {
        Ok(_) => (),
        Err(e) => {
            device.set_status(SerialDeviceStatus::Disconnected);
            return Err(e.into());
        }
    };

    // Get copy of decoded_listener by resubscribing
    let decoded_listener = connection
        .on_decoded_packet
        .as_ref()
        .ok_or("Decoded packet listener not open")?
        .resubscribe();

    device.set_status(SerialDeviceStatus::Configuring);
    connection.configure(device.config_id).await?;

    let handle = app_handle.clone();
    let mesh_devices_arc = mesh_devices.inner.clone();
    let radio_connections_arc = radio_connections.inner.clone();
    let graph_arc = mesh_graph.inner.clone();

    // Save device into Tauri state
    {
        let mut devices_guard = mesh_devices_arc.lock().await;
        devices_guard.insert(address.clone(), device);
    }

    // Save connection into Tauri state
    {
        let mut connections_guard = radio_connections_arc.lock().await;
        connections_guard.insert(address.clone(), Box::new(connection));
    }

    // Needs the device struct and port name to be loaded into Tauri state before running
    spawn_configuration_timeout_handler(
        handle.clone(),
        mesh_devices_arc.clone(),
        address.clone(),
        Duration::from_millis(3000),
    );

    spawn_decoded_handler(
        handle,
        decoded_listener,
        mesh_devices_arc,
        graph_arc,
        address,
    );

    Ok(())
}

#[tauri::command]
pub async fn drop_device_connection(
    port_name: String,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called drop_device_connection command");

    {
        let mut state_devices = mesh_devices.inner.lock().await;
        let mut connections_guard = radio_connections.inner.lock().await;

        connections_guard.remove(&port_name);

        if let Some(device) = state_devices.get_mut(&port_name) {
            device.set_status(SerialDeviceStatus::Disconnected);
        }

        state_devices.remove(&port_name);
    }

    Ok(())
}

#[tauri::command]
pub async fn drop_all_device_connections(
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called drop_all_device_connections command");

    {
        let mut connections_guard = radio_connections.inner.lock().await;
        connections_guard.clear();

        let mut state_devices = mesh_devices.inner.lock().await;

        // Disconnect from all serial ports
        for (_port_name, device) in state_devices.iter_mut() {
            device.set_status(SerialDeviceStatus::Disconnected);
        }

        // Clear connections map
        state_devices.clear();
    }

    Ok(())
}
