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

    // state.add_graph_snapshot(&graph_struct.graph);
    state.set_algorithm_flags(flags);
    // state.run_algos();

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
                let u_res = node_index_to_node_id(&edge.get_source(), &graph_struct.graph)?;
                let v_res = node_index_to_node_id(&edge.get_target(), &graph_struct.graph)?;
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
                let val = val
                    .iter()
                    .map(|(k, v)| {
                        let v: HashMap<u32, f64> = v.iter().map(|(k1, v1)| (*k1, *v1)).collect();

                        (*k, v)
                    })
                    .collect();

                (*key, val)
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
