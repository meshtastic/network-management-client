use crate::{device, graph::ds::graph::MeshGraph};
use log::{debug, trace};
use tauri::Emitter;

use super::ConfigurationStatus;

pub fn dispatch_updated_device<R: tauri::Runtime>(
    handle: &tauri::AppHandle<R>,
    device: &device::MeshDevice,
) -> tauri::Result<()> {
    debug!("Dispatching updated device");

    handle.emit("device_update", device)?;

    trace!("Dispatched updated device");

    Ok(())
}

pub fn dispatch_configuration_status<R: tauri::Runtime>(
    handle: &tauri::AppHandle<R>,
    status: ConfigurationStatus,
) -> tauri::Result<()> {
    debug!("Dispatching configuration status");

    handle.emit("configuration_status", status)?;

    Ok(())
}

pub fn dispatch_rebooting_event<R: tauri::Runtime>(
    handle: &tauri::AppHandle<R>,
) -> tauri::Result<()> {
    debug!("Dispatching rebooting event");

    let current_time_sec = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs();

    handle.emit("reboot", current_time_sec)?;

    Ok(())
}

pub fn dispatch_updated_graph<R: tauri::Runtime>(
    handle: &tauri::AppHandle<R>,
    graph: MeshGraph,
) -> tauri::Result<()> {
    debug!("Dispatching updated graph");

    handle.emit("graph_update", graph)?;

    Ok(())
}
