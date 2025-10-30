use std::time::Duration;

use log::{debug, error, info};

use crate::api::contracts::graph::{
    GetGraphStateRequest, GetGraphStateResponse, InitializeTimeoutHandlerRequest,
    InitializeTimeoutHandlerResponse, StopTimeoutHandlerRequest, StopTimeoutHandlerResponse,
};
use crate::ipc::events::dispatch_updated_graph;
use crate::ipc::CommandError;
use crate::state;

pub const DEFAULT_GRAPH_CLEAN_SECONDS: u64 = 60;

pub async fn handle_get_graph_state(
    _request: GetGraphStateRequest,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<GetGraphStateResponse, CommandError> {
    debug!("Called handle_get_graph_state");

    let mesh_graph_handle = mesh_graph.inner.lock().map_err(|e| e.to_string())?;
    let graph = mesh_graph_handle.clone();

    let response = GetGraphStateResponse { graph };
    Ok(response)
}

pub async fn handle_initialize_timeout_handler(
    _request: InitializeTimeoutHandlerRequest,
    app_handle: tauri::AppHandle,
    mesh_graph_state: tauri::State<'_, state::graph::GraphState>,
) -> Result<InitializeTimeoutHandlerResponse, CommandError> {
    debug!("Called handle_initialize_timeout_handler");

    let mesh_graph_arc = mesh_graph_state.inner.clone();

    let mut mesh_graph_handle = mesh_graph_state.inner.lock().map_err(|e| e.to_string())?;

    if mesh_graph_handle.timeout_handle.is_some() {
        info!("Graph timeout handler already initialized");
        return Ok(InitializeTimeoutHandlerResponse {});
    }

    let handle = tauri::async_runtime::spawn(async move {
        info!(
            "Starting graph timeout handler, sleeping for {:?} seconds",
            DEFAULT_GRAPH_CLEAN_SECONDS
        );

        let app_handle = app_handle;

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

                dispatch_updated_graph(&app_handle, mesh_graph_handle.clone())
                    .expect("Error dispatching updated graph event");
            }

            debug!(
                "Graph cleaned, sleeping for {:?} seconds",
                DEFAULT_GRAPH_CLEAN_SECONDS
            );
        }

        error!("Graph timeout handler stopped");
    });

    mesh_graph_handle.timeout_handle = Some(handle);

    let response = InitializeTimeoutHandlerResponse {};
    Ok(response)
}

pub async fn handle_stop_timeout_handler(
    _request: StopTimeoutHandlerRequest,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<StopTimeoutHandlerResponse, CommandError> {
    debug!("Called handle_stop_timeout_handler");

    let mut mesh_graph_handle = mesh_graph.inner.lock().map_err(|e| e.to_string())?;

    if let Some(handle) = mesh_graph_handle.timeout_handle.take() {
        info!("Stopping graph timeout handler");
        handle.abort();
        info!("Graph timeout handler stopped");
    }

    let response = StopTimeoutHandlerResponse {};
    Ok(response)
}
