use crate::api::contracts::graph::{
    GetGraphStateRequest, GetGraphStateResponse, InitializeTimeoutHandlerRequest,
    InitializeTimeoutHandlerResponse, StopTimeoutHandlerRequest, StopTimeoutHandlerResponse,
};
use crate::domains::graph::{
    handle_get_graph_state, handle_initialize_timeout_handler, handle_stop_timeout_handler,
};
use crate::ipc::CommandError;
use crate::state;

use log::debug;

#[tauri::command]
pub async fn get_graph_state(
    request: GetGraphStateRequest,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<GetGraphStateResponse, CommandError> {
    debug!("Called get_graph_state command");
    let response = handle_get_graph_state(request, mesh_graph).await?;
    Ok(response)
}

#[tauri::command]
pub async fn initialize_timeout_handler(
    request: InitializeTimeoutHandlerRequest,
    app_handle: tauri::AppHandle,
    mesh_graph_state: tauri::State<'_, state::graph::GraphState>,
) -> Result<InitializeTimeoutHandlerResponse, CommandError> {
    debug!("Called initialize_timeout_handler command");
    let response = handle_initialize_timeout_handler(request, app_handle, mesh_graph_state).await?;
    Ok(response)
}

#[tauri::command]
pub async fn stop_timeout_handler(
    request: StopTimeoutHandlerRequest,
    mesh_graph: tauri::State<'_, state::graph::GraphState>,
) -> Result<StopTimeoutHandlerResponse, CommandError> {
    debug!("Called stop_timeout_handler command");
    let response = handle_stop_timeout_handler(request, mesh_graph).await?;
    Ok(response)
}
