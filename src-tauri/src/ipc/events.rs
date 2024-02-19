use crate::device;
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

pub fn dispatch_configuration_status(handle: &tauri::AppHandle, status: ConfigurationStatus) -> () {
    debug!("Dispatching configuration status");

    handle
        .emit_all("configuration_status", status)
        .expect("Failed to dispatch configuration failure message");
}

pub fn dispatch_rebooting_event(handle: &tauri::AppHandle) -> () {
    debug!("Dispatching rebooting event");
    let current_time_sec = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs();

    handle
        .emit_all("reboot", current_time_sec)
        .expect("Failed to dispatch rebooting event");
}
