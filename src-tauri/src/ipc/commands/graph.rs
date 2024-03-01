use std::time::Duration;

use log::{debug, error, info};

use crate::{graph::ds::graph::MeshGraph, ipc::CommandError, state};

pub const DEFAULT_GRAPH_CLEAN_SECONDS: u64 = 60;

#[tauri::command]
pub async fn get_graph_state(
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<MeshGraph, CommandError> {
    debug!("Called get_graph_state command");

    let mesh_graph_handle = mesh_graph.inner.lock().map_err(|e| e.to_string())?;
    let mesh_graph = mesh_graph_handle.clone();

    Ok(mesh_graph)
}

#[tauri::command]
pub async fn initialize_timeout_handler(
    mesh_graph_state: tauri::State<'_, state::graph::GraphState>,
) -> Result<(), CommandError> {
    debug!("Called initialize_timeout_handler command");

    let mesh_graph_arc = mesh_graph_state.inner.clone();

    let mut mesh_graph_handle = mesh_graph_state.inner.lock().map_err(|e| e.to_string())?;

    if mesh_graph_handle.timeout_handle.is_some() {
        info!("Graph timeout handler already initialized");
        return Ok(());
    }

    let handle = tauri::async_runtime::spawn(async move {
        info!(
            "Starting graph timeout handler, sleeping for {:?} seconds",
            DEFAULT_GRAPH_CLEAN_SECONDS
        );

        loop {
            tokio::time::sleep(Duration::from_secs(DEFAULT_GRAPH_CLEAN_SECONDS)).await;

            debug!("Cleaning graph...");

            {
                let mut mesh_graph_handle = match mesh_graph_arc.lock() {
                    Ok(handle) => handle,
                    Err(e) => {
                        log::error!("Error getting graph handle: {}", e);
                        break;
                    }
                };

                mesh_graph_handle.clean();
            }

            debug!(
                "Graph cleaned, sleeping for {:?} seconds",
                DEFAULT_GRAPH_CLEAN_SECONDS
            );
        }

        error!("Graph timeout handler stopped");
    });

    mesh_graph_handle.timeout_handle = Some(handle);

    Ok(())
}

#[tauri::command]
pub async fn stop_timeout_handler(
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<(), CommandError> {
    debug!("Called stop_timeout_handler command");

    let mut mesh_graph_handle = mesh_graph.inner.lock().map_err(|e| e.to_string())?;

    if let Some(handle) = mesh_graph_handle.timeout_handle.take() {
        log::info!("Stopping graph timeout handler");
        handle.abort();
        log::info!("Graph timeout handler stopped");
    }

    Ok(())
}
