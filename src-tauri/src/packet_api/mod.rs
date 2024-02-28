use std::sync::{Arc, LockResult, Mutex};

// use meshtastic::connections::stream_api::{state::Configured, StreamApi};

use crate::{device::MeshDevice, graph::ds::graph::MeshGraph, state::DeviceKey};

pub mod handlers;
pub mod router;

pub struct MeshPacketApi<R: tauri::Runtime = tauri::Wry> {
    pub app_handle: tauri::AppHandle<R>,
    pub device_key: DeviceKey,
    pub device: MeshDevice,
    pub graph_arc: Arc<Mutex<MeshGraph>>,
}

impl<R: tauri::Runtime> MeshPacketApi<R> {
    pub fn new(
        app_handle: tauri::AppHandle<R>,
        device_key: DeviceKey,
        device: MeshDevice,
        graph_arc: Arc<Mutex<MeshGraph>>,
    ) -> Self {
        Self {
            app_handle,
            device_key,
            device,
            graph_arc,
        }
    }

    pub fn get_locked_graph(&self) -> LockResult<std::sync::MutexGuard<MeshGraph>> {
        self.graph_arc.lock()
    }
}
