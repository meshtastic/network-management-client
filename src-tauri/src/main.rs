mod analytics;
mod constructors;
mod data_conversion;
mod graph;
mod mesh;

use analytics::algo_store::AlgoStore;
use app::protobufs;
use mesh::serial_connection::{MeshConnection, SerialConnection};
use serde::{Deserialize, Serialize};
use std::{sync::Arc, collections::HashMap};
use tauri::{async_runtime, Manager};

struct ActiveSerialConnection {
    inner: Arc<async_runtime::Mutex<Option<mesh::serial_connection::SerialConnection>>>,
}

struct ActiveMeshDevice {
    inner: Arc<async_runtime::Mutex<Option<mesh::device::MeshDevice>>>,
}

struct ActiveMeshGraph {
    inner: Arc<async_runtime::Mutex<Option<mesh::device::MeshGraph>>>,
}

struct ActiveMeshState {
    inner: Arc<async_runtime::Mutex<Option<analytics::state::State>>>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, thiserror::Error)]
#[serde(rename_all = "camelCase")]
struct CommandError {
    message: String,
}

impl std::fmt::Display for CommandError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "CommandError: \"{}\"", self.message)
    }
}

impl From<String> for CommandError {
    fn from(value: String) -> Self {
        Self { message: value }
    }
}
impl From<&str> for CommandError {
    fn from(value: &str) -> Self {
        Self {
            message: value.into(),
        }
    }
}

fn main() {
    tracing_subscriber::fmt::init();
    tauri::Builder::default()
        .manage(ActiveSerialConnection {
            inner: Arc::new(async_runtime::Mutex::new(None)),
        })
        .manage(ActiveMeshDevice {
            inner: Arc::new(async_runtime::Mutex::new(Some(
                mesh::device::MeshDevice::new(),
            ))),
        })
        .manage(ActiveMeshGraph {
            inner: Arc::new(async_runtime::Mutex::new(Some(
                mesh::device::MeshGraph::new(),
            ))),
        })
        .manage(ActiveMeshState {
            inner: Arc::new(async_runtime::Mutex::new(Some(
                analytics::state::State::new(HashMap::new(), false),
            ))),
        })
        .invoke_handler(tauri::generate_handler![
            get_all_serial_ports,
            connect_to_serial_port,
            disconnect_from_serial_port,
            send_text,
            update_device_config,
            update_device_user,
            send_waypoint,
            get_node_edges,
            run_algorithms
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_all_serial_ports() -> Result<Vec<String>, CommandError> {
    let ports = SerialConnection::get_available_ports()?;
    Ok(ports)
}

#[tauri::command]
async fn connect_to_serial_port(
    port_name: String,
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
    mesh_graph: tauri::State<'_, ActiveMeshGraph>,
    algo_state: tauri::State<'_, ActiveMeshState>,
) -> Result<(), CommandError> {
    let mut connection = SerialConnection::new();
    let new_device = mesh::device::MeshDevice::new();
    let new_graph = mesh::device::MeshGraph::new();
    let state = analytics::state::State::new(HashMap::new(), false);

    connection.connect(app_handle.clone(), port_name, 115_200)?;
    connection.configure(new_device.config_id)?;

    let mut decoded_listener = connection
        .on_decoded_packet
        .as_ref()
        .ok_or("Decoded packet listener not open")?
        .resubscribe();

    let handle = app_handle.app_handle().clone();
    let mesh_device_arc = mesh_device.inner.clone();
    let mesh_graph_arc = mesh_graph.inner.clone();
    let algo_state_arc = algo_state.inner.clone();

    {
        let mut new_graph_guard = mesh_graph_arc.lock().await;
        *new_graph_guard = Some(new_graph);
    }

    {
        let mut new_device_guard = mesh_device_arc.lock().await;
        *new_device_guard = Some(new_device);
    }

    {
        let mut new_state_guard = algo_state_arc.lock().await;
        *new_state_guard = Some(state);
    }

    tauri::async_runtime::spawn(async move {
        while let Ok(message) = decoded_listener.recv().await {
            let variant = match message.payload_variant {
                Some(v) => v,
                None => continue,
            };

            let mut device_guard = mesh_device_arc.lock().await;
            let mut graph_guard = mesh_graph_arc.lock().await;
            let mut state_guard = algo_state_arc.lock().await;

            let device = match device_guard.as_mut().ok_or("Device not initialized") {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("{:?}", e);
                    continue;
                }
            };

            let graph = match graph_guard.as_mut().ok_or("Graph not initialized") {
                Ok(g) => g,
                Err(e) => {
                    eprintln!("{:?}", e);
                    continue;
                }
            };

            let state = match state_guard.as_mut().ok_or("State not initialized") {
                Ok(s) => s,
                Err(e) => {
                    eprintln!("{:?}", e);
                    continue;
                }
            };

            let device_updated =
                match device.handle_packet_from_radio(variant, Some(handle.clone()), Some(graph)) {
                    Ok(d) => d,
                    Err(e) => {
                        eprintln!("Error transmitting packet: {}", e);
                        continue;
                    }
                };

            if device_updated {
                match dispatch_updated_device(handle.clone(), device.clone()) {
                    Ok(_) => (),
                    Err(e) => {
                        eprintln!("Error emitting event to client: {:?}", e.to_string());
                        continue;
                    }
                };
            }
        }
    });

    {
        let mut state_connection = serial_connection.inner.lock().await;
        *state_connection = Some(connection);
    }

    Ok(())
}

#[tauri::command]
async fn disconnect_from_serial_port(
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), CommandError> {
    // Completely drop device memory
    {
        let mut state_device = mesh_device.inner.lock().await;
        *state_device = None;
    }

    // Clear serial connection state
    {
        let mut state_connection = serial_connection.inner.lock().await;

        if let Some(connection) = state_connection.as_mut() {
            connection.disconnect()?;
        }
    }

    Ok(())
}

fn dispatch_updated_device(
    handle: tauri::AppHandle,
    device: mesh::device::MeshDevice,
) -> tauri::Result<()> {
    handle.emit_all("device_update", device)
}

#[tauri::command]
async fn send_text(
    text: String,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), CommandError> {
    let mut serial_guard = serial_connection.inner.lock().await;
    let mut device_guard = mesh_device.inner.lock().await;

    let connection = serial_guard.as_mut().ok_or("Connection not initialized")?;
    let device = device_guard.as_mut().ok_or("Device not connected")?;

    device.send_text(
        connection,
        text.clone(),
        mesh::serial_connection::PacketDestination::BROADCAST,
        true,
        channel,
    )?;

    dispatch_updated_device(app_handle, device.clone()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn update_device_config(
    config: protobufs::Config,
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), CommandError> {
    let mut serial_guard = serial_connection.inner.lock().await;
    let mut device_guard = mesh_device.inner.lock().await;

    let connection = serial_guard.as_mut().ok_or("Connection not initialized")?;
    let device = device_guard.as_mut().ok_or("Device not connected")?;

    device.update_device_config(connection, config)?;

    Ok(())
}

#[tauri::command]
async fn update_device_user(
    user: protobufs::User,
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), CommandError> {
    let mut serial_guard = serial_connection.inner.lock().await;
    let mut device_guard = mesh_device.inner.lock().await;

    let connection = serial_guard.as_mut().ok_or("Connection not initialized")?;
    let device = device_guard.as_mut().ok_or("Device not connected")?;

    device.update_device_user(connection, user)?;

    Ok(())
}

#[tauri::command]
async fn send_waypoint(
    waypoint: protobufs::Waypoint,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, ActiveMeshDevice>,
    serial_connection: tauri::State<'_, ActiveSerialConnection>,
) -> Result<(), CommandError> {
    let mut serial_guard = serial_connection.inner.lock().await;
    let mut device_guard = mesh_device.inner.lock().await;

    let connection = serial_guard
        .as_mut()
        .ok_or("Connection not initialized")
        .map_err(|e| e.to_string())?;

    let device = device_guard
        .as_mut()
        .ok_or("Device not connected")
        .map_err(|e| e.to_string())?;

    device.send_waypoint(
        connection,
        waypoint,
        mesh::serial_connection::PacketDestination::BROADCAST,
        true,
        channel,
    )?;

    dispatch_updated_device(app_handle, device.clone()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn get_node_edges(
    mesh_graph: tauri::State<'_, ActiveMeshGraph>,
) -> Result<geojson::FeatureCollection, String> {
    let mut guard = mesh_graph.inner.lock().await;
    let graph = guard
        .as_mut()
        .ok_or("Graph not initialized")
        .map_err(|e| e.to_string())?;

    let edge_features: Vec<geojson::Feature> = graph
        .graph
        .get_edges()
        .iter()
        .map(|e| {
            let u = graph.graph.get_node(e.u);
            let v = graph.graph.get_node(e.v);

            geojson::Feature {
                id: Some(geojson::feature::Id::String(format!(
                    "{}-{}",
                    u.name, v.name
                ))),
                properties: None,
                geometry: Some(geojson::Geometry::new(geojson::Value::LineString(vec![
                    vec![u.latitude, u.longitude],
                    vec![v.latitude, v.longitude],
                ]))),
                ..Default::default()
            }
        })
        .collect();

    let edges = geojson::FeatureCollection {
        bbox: None,
        foreign_members: None,
        features: edge_features,
    };

    Ok(edges)
}

#[tauri::command]
async fn run_algorithms(
    bitfield: u8,
    mesh_graph: tauri::State<'_, ActiveMeshGraph>,
    algo_state: tauri::State<'_, ActiveMeshState>,
) -> Result<AlgoStore, String> {
    let mut guard = mesh_graph.inner.lock().await;
    let mut state_guard = algo_state.inner.lock().await;
    let graph_struct = guard
        .as_mut()
        .ok_or("Graph not initialized")
        .map_err(|e| e.to_string())?;
    let state = state_guard
        .as_mut()
        .ok_or("State not initialized")
        .map_err(|e| e.to_string())?;

    state.add_graph(&graph_struct.graph);
    state.set_algos(bitfield);
    state.run_algos();
    Ok(state.get_algo_results().clone())
}
