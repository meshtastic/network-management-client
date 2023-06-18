use crate::analytics::algorithms::articulation_point::results::APResult;
use crate::analytics::algorithms::diffusion_centrality::results::DiffCenResult;
use crate::analytics::algorithms::stoer_wagner::results::MinCutResult;
use crate::analytics::state::configuration::AlgorithmConfigFlags;
use crate::device;
use crate::device::connections;
use crate::device::connections::serial::SerialConnection;
use crate::device::connections::MeshConnection;
use crate::device::connections::PacketDestination;
use crate::device::SerialDeviceStatus;
use crate::ipc::helpers::spawn_configuration_timeout_handler;
use crate::ipc::helpers::spawn_decoded_handler;
use crate::state;

use app::protobufs;
use log::{debug, error, trace};
use serde::Deserialize;
use serde::Serialize;
use serde_json::json;
use std::collections::HashMap;
use std::time::Duration;

use super::helpers;
use super::CommandError;
use super::DeviceBulkConfig;
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

    helpers::initialize_serial_connection_handlers(
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

    // * Needs the device struct and port name to be loaded into Tauri state before running
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

#[tauri::command]
pub async fn send_text(
    port_name: String,
    text: String,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called send_text command",);
    trace!("Called with text {} on channel {}", text, channel);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
        .ok_or("Radio connection not initialized")?;

    connection
        .send_text(
            device,
            text.clone(),
            PacketDestination::Broadcast,
            true,
            channel,
        )
        .await?;

    events::dispatch_updated_device(&app_handle, device).map_err(|e| e.to_string())?;

    Ok(())
}

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
pub async fn send_waypoint(
    port_name: String,
    waypoint: protobufs::Waypoint,
    channel: u32,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
) -> Result<(), CommandError> {
    debug!("Called send_waypoint command");
    trace!("Called on channel {} with waypoint {:?}", channel, waypoint);

    let mut devices_guard = mesh_devices.inner.lock().await;
    let device = devices_guard
        .get_mut(&port_name)
        .ok_or("Device not connected")?;

    let mut connections_guard = radio_connections.inner.lock().await;
    let connection = connections_guard
        .get_mut(&port_name)
        .ok_or("Radio connection not initialized")?;

    connection
        .send_waypoint(
            device,
            waypoint,
            PacketDestination::Broadcast,
            true,
            channel,
        )
        .await?;

    events::dispatch_updated_device(&app_handle, device).map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GraphGeoJSONResult {
    pub nodes: geojson::FeatureCollection,
    pub edges: geojson::FeatureCollection,
}

pub fn generate_node_properties(num: u32) -> serde_json::Map<String, serde_json::Value> {
    let mut properties = serde_json::Map::new();
    properties.insert("num".into(), json!(num));
    properties
}

pub fn generate_edge_properties(snr: f64) -> serde_json::Map<String, serde_json::Value> {
    let mut properties = serde_json::Map::new();
    properties.insert("snr".into(), json!(snr));
    properties
}

#[tauri::command]
pub async fn get_node_edges(
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
    connected_devices: tauri::State<'_, state::MeshDevices>,
) -> Result<GraphGeoJSONResult, CommandError> {
    trace!("Called get_node_edges command");

    let mut graph_guard = mesh_graph.inner.lock().await;
    let _graph = graph_guard.as_mut().ok_or("Graph edges not initialized")?;

    // Generate nodes and edges from connected devices
    // * Note: this makes the false assumption that all nodes are fully connected

    let devices_guard = connected_devices.inner.lock().await;
    let device_edge_info = devices_guard.values().fold(vec![], |accum, d| {
        let filtered_nodes = d
            .nodes
            .iter()
            .filter_map(|(num, node)| {
                node.data.clone().position.map(|position| {
                    (
                        *num,
                        vec![
                            (position.longitude_i as f64) / 1e7,
                            (position.latitude_i as f64) / 1e7,
                        ],
                    )
                })
            })
            .collect::<Vec<(u32, geojson::Position)>>();

        let mut result = vec![];
        result.extend(accum);
        result.extend(filtered_nodes);
        result
    });

    let mut node_features = vec![];
    let mut edge_features = vec![];

    for (index, (num, position)) in device_edge_info.iter().enumerate() {
        node_features.push(geojson::Feature {
            id: Some(geojson::feature::Id::String(num.to_string())),
            geometry: Some(geojson::Geometry::new(geojson::Value::Point(
                position.clone(),
            ))),
            properties: Some(generate_node_properties(num.to_owned())),
            ..Default::default()
        });

        for (idx, (_n, pos)) in device_edge_info.iter().enumerate() {
            edge_features.push(geojson::Feature {
                id: Some(geojson::feature::Id::String(
                    (index * device_edge_info.len() + idx).to_string(),
                )),
                geometry: Some(geojson::Geometry::new(geojson::Value::LineString(vec![
                    position.clone(),
                    pos.clone(),
                ]))),
                properties: Some(generate_edge_properties(1.)),
                ..Default::default()
            });
        }
    }

    let nodes = geojson::FeatureCollection {
        bbox: None,
        foreign_members: None,
        features: node_features,
    };

    let edges = geojson::FeatureCollection {
        bbox: None,
        foreign_members: None,
        // features: vec![],
        features: edge_features, // * enable to see fully-connected network
    };

    trace!("Found edges {:?}", edges);

    Ok(GraphGeoJSONResult { nodes, edges })
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

// UNUSED
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
