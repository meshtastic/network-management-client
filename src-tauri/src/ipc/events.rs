use crate::mesh;
use log::{debug, trace};
use tauri::Manager;

pub fn dispatch_updated_device(
    handle: tauri::AppHandle,
    device: mesh::device::MeshDevice,
) -> tauri::Result<()> {
    debug!("Dispatching updated device");

    handle.emit_all("device_update", device)?;

    trace!("Dispatched updated device");

    Ok(())
}

pub fn dispatch_updated_edges(
    handle: tauri::AppHandle,
    graph: &mut mesh::device::MeshGraph,
) -> tauri::Result<()> {
    debug!("Dispatching updated edges");

    let edges = super::helpers::generate_graph_edges_geojson(graph);
    handle.emit_all("graph_update", edges)?;

    debug!("Dispatched updated edges");

    Ok(())
}
