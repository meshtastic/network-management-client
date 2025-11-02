use crate::api::contracts::connections::{
    ConnectToBluetoothRequest, ConnectToBluetoothResponse, ConnectToSerialPortRequest,
    ConnectToSerialPortResponse, ConnectToTcpPortRequest, ConnectToTcpPortResponse,
    DropAllDeviceConnectionsRequest, DropAllDeviceConnectionsResponse, DropDeviceConnectionRequest,
    DropDeviceConnectionResponse, GetAllBluetoothRequest, GetAllBluetoothResponse,
    GetAllSerialPortsRequest, GetAllSerialPortsResponse, RequestAutoconnectPortRequest,
    RequestAutoconnectPortResponse,
};
use crate::domains::connections::{
    handle_connect_to_bluetooth, handle_connect_to_serial_port, handle_connect_to_tcp_port,
    handle_drop_all_device_connections, handle_drop_device_connection, handle_get_all_bluetooth,
    handle_get_all_serial_ports, handle_request_autoconnect_port,
};
use crate::ipc::CommandError;
use crate::state;

use log::debug;

#[tauri::command]
pub async fn request_autoconnect_port(
    request: RequestAutoconnectPortRequest,
    autoconnect_state: tauri::State<'_, state::autoconnect::AutoConnectState>,
) -> Result<RequestAutoconnectPortResponse, CommandError> {
    debug!("Called request_autoconnect_port command");
    let response = handle_request_autoconnect_port(request, autoconnect_state).await?;
    Ok(response)
}

#[tauri::command]
pub async fn get_all_bluetooth(
    request: GetAllBluetoothRequest,
) -> Result<GetAllBluetoothResponse, CommandError> {
    debug!("Called get_all_bluetooth command");
    let response = handle_get_all_bluetooth(request).await?;
    Ok(response)
}

#[tauri::command]
pub fn get_all_serial_ports(
    request: GetAllSerialPortsRequest,
) -> Result<GetAllSerialPortsResponse, CommandError> {
    debug!("Called get_all_serial_ports command");
    let response = handle_get_all_serial_ports(request)?;
    Ok(response)
}

#[tauri::command]
pub async fn connect_to_bluetooth(
    request: ConnectToBluetoothRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<ConnectToBluetoothResponse, CommandError> {
    debug!("Called connect_to_bluetooth command");
    let response = handle_connect_to_bluetooth(
        request,
        app_handle,
        mesh_devices,
        radio_connections,
        mesh_graph,
    )
    .await?;
    Ok(response)
}

#[tauri::command]
pub async fn connect_to_serial_port(
    request: ConnectToSerialPortRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<ConnectToSerialPortResponse, CommandError> {
    debug!("Called connect_to_serial_port command");
    let response = handle_connect_to_serial_port(
        request,
        app_handle,
        mesh_devices,
        radio_connections,
        mesh_graph,
    )
    .await?;
    Ok(response)
}

#[tauri::command]
pub async fn connect_to_tcp_port(
    request: ConnectToTcpPortRequest,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<ConnectToTcpPortResponse, CommandError> {
    debug!("Called connect_to_tcp_port command");
    let response = handle_connect_to_tcp_port(
        request,
        app_handle,
        mesh_devices,
        radio_connections,
        mesh_graph,
    )
    .await?;
    Ok(response)
}

#[tauri::command]
pub async fn drop_device_connection(
    request: DropDeviceConnectionRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<DropDeviceConnectionResponse, CommandError> {
    debug!("Called drop_device_connection command");
    let response = handle_drop_device_connection(request, mesh_devices, radio_connections).await?;
    Ok(response)
}

#[tauri::command]
pub async fn drop_all_device_connections(
    request: DropAllDeviceConnectionsRequest,
    mesh_devices: tauri::State<'_, state::mesh_devices::MeshDevicesState>,
    radio_connections: tauri::State<'_, state::radio_connections::RadioConnectionsState>,
) -> Result<DropAllDeviceConnectionsResponse, CommandError> {
    debug!("Called drop_all_device_connections command");
    let response =
        handle_drop_all_device_connections(request, mesh_devices, radio_connections).await?;
    Ok(response)
}
