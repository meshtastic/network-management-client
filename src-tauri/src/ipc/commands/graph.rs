use crate::analytics::algorithms::articulation_point::results::APResult;
use crate::analytics::algorithms::diffusion_centrality::results::DiffCenResult;
use crate::analytics::algorithms::stoer_wagner::results::MinCutResult;
use crate::analytics::state::configuration::AlgorithmConfigFlags;
use crate::ipc;
use crate::ipc::helpers::node_index_to_node_id;
use crate::ipc::APMincutStringResults;
use crate::ipc::CommandError;
use crate::state;

use log::{debug, error, trace};
use serde::Deserialize;
use serde::Serialize;
use serde_json::json;
use std::collections::HashMap;

#[tauri::command]
pub async fn initialize_graph_state(
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
    algo_state: tauri::State<'_, state::AnalyticsState>,
) -> Result<(), CommandError> {
    debug!("Called initialize_graph_state command");
    ipc::helpers::initialize_graph_state(mesh_graph, algo_state).await
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
            .filter_map(|nodeindex| node_index_to_node_id(nodeindex, &graph_struct.graph))
            .collect(),
        APResult::Error(err) => return Err(err.to_owned().into()),
        APResult::Empty(_) => vec![],
    };

    // convert mincut from a vector of Edges to a vector of string pairs
    let mincut_vec: Vec<(u32, u32)> = match &algo_result.mincut {
        MinCutResult::Success(aps) => aps
            .iter()
            .filter_map(|edge| {
                let u_res = node_index_to_node_id(&edge.get_u(), &graph_struct.graph)?;
                let v_res = node_index_to_node_id(&edge.get_v(), &graph_struct.graph)?;
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
