use crate::{
    device::{self, mesh_graph::MeshGraph},
    ipc::{
        commands::graph::GraphGeoJSONResult,
        helpers::{generate_graph_edges_geojson, generate_graph_nodes_geojson},
    },
};
// use crate::{ipc::commands::GraphGeoJSONResult};
use log::{debug, trace};
use tauri::Manager;

use super::ConfigurationStatus;

pub fn dispatch_updated_device(
    handle: &tauri::AppHandle,
    device: &device::MeshDevice,
) -> tauri::Result<()> {
    debug!("Dispatching updated device");

    handle.emit_all("device_update", device)?;

    trace!("Dispatched updated device");

    Ok(())
}

pub fn dispatch_updated_edges(
    handle: &tauri::AppHandle,
    graph: &mut MeshGraph,
) -> tauri::Result<()> {
    debug!("Dispatching updated edges");

    let nodes = generate_graph_nodes_geojson(graph);
    let edges = generate_graph_edges_geojson(graph);

    // * This is temporarily disabled until we can figure out how to get the graph to update in-place
    handle.emit_all::<GraphGeoJSONResult>("graph_update", GraphGeoJSONResult { nodes, edges })?;

    trace!("Dispatched updated edges");

    Ok(())
}

pub fn dispatch_configuration_status(
    handle: &tauri::AppHandle,
    status: ConfigurationStatus,
) -> tauri::Result<()> {
    debug!("Dispatching configuration status");
    handle.emit_all("configuration_status", status)
}

pub fn dispatch_rebooting_event(handle: &tauri::AppHandle) -> tauri::Result<()> {
    debug!("Dispatching rebooting event");
    let current_time_sec = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    handle.emit_all("reboot", current_time_sec)
}
