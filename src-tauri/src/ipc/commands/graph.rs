use log::debug;

use crate::{graph::ds::graph::MeshGraph, ipc::CommandError, state};

#[tauri::command]
pub async fn get_graph_state(
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<MeshGraph, CommandError> {
    debug!("Called get_graph_state command");

    let mesh_graph_handle = mesh_graph.inner.lock().await;
    let mesh_graph = mesh_graph_handle.clone();

    Ok(mesh_graph)
}
