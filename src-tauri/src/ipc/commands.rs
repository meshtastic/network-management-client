use crate::analytics;
use crate::analytics::algorithms::articulation_point::results::APResult;
use crate::analytics::algorithms::diffusion_centrality::results::DiffCenResult;
use crate::analytics::algorithms::stoer_wagner::results::MinCutResult;
use crate::analytics::state::configuration::AlgorithmConfigFlags;
use crate::mesh::{self, serial_connection::MeshConnection};
use crate::state;

use app::protobufs;
use std::collections::HashMap;
use tauri::Manager;

use super::helpers;
use super::CommandError;
use super::{events, APMincutStringResults};

#[tauri::command]
pub async fn initialize_graph_state(
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
    algo_state: tauri::State<'_, state::AnalyticsState>,
) -> Result<(), CommandError> {
    let new_graph = mesh::device::MeshGraph::new();
    let state = analytics::state::AnalyticsState::new(HashMap::new(), false);
    let mesh_graph_arc = mesh_graph.inner.clone();
    let algo_state_arc = algo_state.inner.clone();

    {
        let mut new_graph_guard = mesh_graph_arc.lock().await;
        *new_graph_guard = Some(new_graph);
    }

    {
        let mut new_state_guard = algo_state_arc.lock().await;
        *new_state_guard = Some(state);
    }

    Ok(())
}

#[tauri::command]
pub fn get_all_serial_ports() -> Result<Vec<String>, CommandError> {
    let ports = mesh::serial_connection::SerialConnection::get_available_ports()?;
    Ok(ports)
}

#[tauri::command]
pub async fn connect_to_serial_port(
    port_name: String,
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
) -> Result<(), CommandError> {
    let mut connection = mesh::serial_connection::SerialConnection::new();
    let new_device = mesh::device::MeshDevice::new();

    connection.connect(app_handle.clone(), port_name, 115_200)?;
    connection.configure(new_device.config_id)?;

    let mut decoded_listener = connection
        .on_decoded_packet
        .as_ref()
        .ok_or("Decoded packet listener not open")?
        .resubscribe();

    let handle = app_handle.app_handle().clone();
    let mesh_device_arc = mesh_device.inner.clone();

    // Only need to lock to set device in tauri state
    {
        let mut new_device_guard = mesh_device_arc.lock().await;
        *new_device_guard = Some(new_device);
    }

    let graph_arc = mesh_graph.inner.clone();

    tauri::async_runtime::spawn(async move {
        while let Ok(message) = decoded_listener.recv().await {
            let variant = match message.payload_variant {
                Some(v) => v,
                None => continue,
            };

            let mut device_guard = mesh_device_arc.lock().await;
            let device = match device_guard.as_mut().ok_or("Device not initialized") {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("{:?}", e);
                    continue;
                }
            };
            let mut graph_guard = graph_arc.lock().await;
            let graph = match graph_guard.as_mut().ok_or("Graph not initialized") {
                Ok(g) => g,
                Err(e) => {
                    eprintln!("{:?}", e);
                    continue;
                }
            };

            let (device_updated, graph_updated) =
                match device.handle_packet_from_radio(variant, Some(handle.clone()), Some(graph)) {
                    Ok(d) => d,
                    Err(e) => {
                        eprintln!("Error transmitting packet: {}", e);
                        continue;
                    }
                };

            println!("Updates: {:?}, {:?}", device_updated, graph_updated);

            if device_updated {
                match events::dispatch_updated_device(handle.clone(), device.clone()) {
                    Ok(_) => (),
                    Err(e) => {
                        eprintln!("Error emitting event to client: {:?}", e.to_string());
                        continue;
                    }
                };
            }

            if graph_updated {
                match events::dispatch_updated_edges(handle.clone(), graph) {
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
pub async fn disconnect_from_serial_port(
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
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

#[tauri::command]
pub async fn send_text(
    text: String,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
) -> Result<(), CommandError> {
    let mut serial_guard = serial_connection.inner.lock().await;
    let mut device_guard = mesh_device.inner.lock().await;

    let connection = serial_guard.as_mut().ok_or("Connection not initialized")?;
    let device = device_guard.as_mut().ok_or("Device not connected")?;

    device.send_text(
        connection,
        text.clone(),
        mesh::serial_connection::PacketDestination::Broadcast,
        true,
        channel,
    )?;

    events::dispatch_updated_device(app_handle, device.clone()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn update_device_config(
    config: protobufs::Config,
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
) -> Result<(), CommandError> {
    let mut serial_guard = serial_connection.inner.lock().await;
    let mut device_guard = mesh_device.inner.lock().await;

    let connection = serial_guard.as_mut().ok_or("Connection not initialized")?;
    let device = device_guard.as_mut().ok_or("Device not connected")?;

    device.update_device_config(connection, config)?;

    Ok(())
}

#[tauri::command]
pub async fn update_device_user(
    user: protobufs::User,
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
) -> Result<(), CommandError> {
    let mut serial_guard = serial_connection.inner.lock().await;
    let mut device_guard = mesh_device.inner.lock().await;

    let connection = serial_guard.as_mut().ok_or("Connection not initialized")?;
    let device = device_guard.as_mut().ok_or("Device not connected")?;

    device.update_device_user(connection, user)?;

    Ok(())
}

#[tauri::command]
pub async fn send_waypoint(
    waypoint: protobufs::Waypoint,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
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
        mesh::serial_connection::PacketDestination::Broadcast,
        true,
        channel,
    )?;

    events::dispatch_updated_device(app_handle, device.clone()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_node_edges(
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
) -> Result<geojson::FeatureCollection, CommandError> {
    let mut guard = mesh_graph.inner.lock().await;
    let graph = guard
        .as_mut()
        .ok_or("Graph not initialized")
        .map_err(|e| e.to_string())?;

    let edges = helpers::generate_graph_edges_geojson(graph);

    Ok(edges)
}

#[tauri::command]
pub async fn run_algorithms(
    flags: AlgorithmConfigFlags,
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
    algo_state: tauri::State<'_, state::AnalyticsState>,
) -> Result<APMincutStringResults, CommandError> {
    let mut guard = mesh_graph.inner.lock().await;
    let mut state_guard = algo_state.inner.lock().await;

    let graph_struct = guard.as_mut().ok_or("Graph not initialized")?;
    let state = state_guard.as_mut().ok_or("State not initialized")?;

    println!("Running algorithms with flags:\n{:#?}", flags);

    state.add_graph_snapshot(&graph_struct.graph);
    state.set_algorithm_flags(flags);
    state.run_algos();
    let algo_result = state.get_algo_results();

    // convert AP from a vector of NodeIndexes to a vector of IDs (strings)
    let ap_vec: Vec<u32> = match &algo_result.aps {
        APResult::Success(aps) => aps
            .iter()
            .filter_map(|nodeindex| helpers::node_index_to_node_id(nodeindex, &graph_struct.graph))
            .collect(),
        APResult::Error(err) => return Err(err.to_owned().into()),
        APResult::Empty(_) => vec![],
    };

    // convert mincut from a vector of Edges to a vector of string pairs
    let mincut_vec: Vec<(u32, u32)> = match &algo_result.mincut {
        MinCutResult::Success(aps) => aps
            .iter()
            .filter_map(|edge| {
                let u_res = helpers::node_index_to_node_id(&edge.get_u(), &graph_struct.graph)?;
                let v_res = helpers::node_index_to_node_id(&edge.get_v(), &graph_struct.graph)?;
                Some((u_res, v_res))
            })
            .collect(),
        MinCutResult::Error(err) => return Err(err.to_owned().into()),
        MinCutResult::Empty(_) => vec![],
    };

    let diffcen_maps: HashMap<u32, HashMap<u32, HashMap<u32, f64>>> = match &algo_result.diff_cent {
        DiffCenResult::Success(diff_cen_res) => diff_cen_res
            .iter()
            .map(|(key, val)| {
                let key = key.parse::<u32>().unwrap_or(0);
                let val = val
                    .iter()
                    .map(|(k, v)| {
                        let k = k.parse::<u32>().unwrap_or(0);
                        let v: HashMap<u32, f64> = v
                            .iter()
                            .map(|(k1, v1)| {
                                let k1 = k1.parse::<u32>().unwrap_or(0);
                                (k1, *v1)
                            })
                            .collect();
                        (k, v)
                    })
                    .collect();
                (key, val)
            })
            .collect(),
        DiffCenResult::Error(err) => {
            eprintln!("{:?}", err);
            return Err("Diffusion centrality algorithm failed".into());
        }
        DiffCenResult::Empty(_) => HashMap::new(),
    };

    Ok(APMincutStringResults {
        ap_result: ap_vec,
        mincut_result: mincut_vec,
        diffcen_result: diffcen_maps,
    })
}
