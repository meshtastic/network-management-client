use crate::mesh;
use tauri::Manager;

pub fn dispatch_updated_device(
    handle: tauri::AppHandle,
    device: mesh::device::MeshDevice,
) -> tauri::Result<()> {
    handle.emit_all("device_update", device)
}

pub fn dispatch_updated_edges(
    handle: tauri::AppHandle,
    graph: &mut mesh::device::MeshGraph,
) -> tauri::Result<()> {
    let edges = super::helpers::generate_graph_edges_geojson(graph);
    handle.emit_all("graph_update", edges)
}
