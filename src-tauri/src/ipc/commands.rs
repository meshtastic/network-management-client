use crate::analytics::algorithms::articulation_point::results::APResult;
use crate::analytics::algorithms::diffusion_centrality::results::DiffCenResult;
use crate::analytics::algorithms::stoer_wagner::results::MinCutResult;
use crate::analytics::state::configuration::AlgorithmConfigFlags;
use crate::mesh;
use crate::state;

use app::protobufs;
use log::{debug, error, trace};
use std::collections::HashMap;

use super::helpers;
use super::CommandError;
use super::{events, APMincutStringResults};

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
pub async fn initialize_graph_state(
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
    algo_state: tauri::State<'_, state::AnalyticsState>,
) -> Result<(), CommandError> {
    debug!("Called initialize_graph_state command");
    helpers::initialize_graph_state(mesh_graph, algo_state).await
}

#[tauri::command]
pub fn get_all_serial_ports() -> Result<Vec<String>, CommandError> {
    debug!("Called get_all_serial_ports command");
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
    debug!(
        "Called connect_to_serial_port command with port \"{}\"",
        port_name
    );

    helpers::initialize_serial_connection_handlers(
        port_name,
        app_handle,
        mesh_device,
        serial_connection,
        mesh_graph,
    )
    .await
}

#[tauri::command]
pub async fn disconnect_from_serial_port(
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
) -> Result<(), CommandError> {
    debug!("Called disconnect_from_serial_port command");

    // Completely drop device memory
    {
        let mut state_device = mesh_device.inner.lock().await;
        *state_device = None;
    }

    // Clear serial connection state
    {
        let mut state_connection = serial_connection.inner.lock().await;

        if let Some(connection) = state_connection.as_mut() {
            debug!("Connection exists, disconnecting");
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
    debug!("Called send_text command",);
    trace!("Called with text {} on channel {}", text, channel);

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

    events::dispatch_updated_device(&app_handle, device.clone()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn update_device_config(
    config: protobufs::Config,
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
) -> Result<(), CommandError> {
    debug!("Called update_device_config command");
    trace!("Called with config {:?}", config);

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
    debug!("Called update_device_user command");
    trace!("Called with user {:?}", user);

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
    debug!("Called send_waypoint command");
    trace!("Called on channel {} with waypoint {:?}", channel, waypoint);

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

    events::dispatch_updated_device(&app_handle, device.clone()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_node_edges(
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
) -> Result<geojson::FeatureCollection, CommandError> {
    debug!("Called get_node_edges command");

    let mut guard = mesh_graph.inner.lock().await;
    let graph = guard.as_mut().ok_or("Graph edges not initialized")?;

    let edges = helpers::generate_graph_edges_geojson(graph);

    trace!("Found edges {:?}", edges);

    Ok(edges)
}

#[tauri::command]
pub async fn run_algorithms(
    flags: AlgorithmConfigFlags,
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
    algo_state: tauri::State<'_, state::AnalyticsState>,
) -> Result<APMincutStringResults, CommandError> {
    debug!("Called run_algorithms command");
    trace!("Running algorithms with flags {:?}", flags);

    let mut guard = mesh_graph.inner.lock().await;
    let mut state_guard = algo_state.inner.lock().await;

    let graph_struct = guard.as_mut().ok_or("Graph not initialized")?;
    let state = state_guard.as_mut().ok_or("State not initialized")?;

    state.add_graph_snapshot(&graph_struct.graph);
    state.set_algorithm_flags(flags);
    state.run_algos();

    let algo_result = state.get_algo_results();

    debug!("Received algorithm results: {:?}", algo_result);

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
            error!("{:?}", err);
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
