use std::sync::Arc;

// use meshtastic::connections::stream_api::{state::Configured, StreamApi};
use tokio::sync::Mutex;

use crate::{device::MeshDevice, graph::ds::graph::MeshGraph};

pub mod handlers;
pub mod router;

pub struct MeshPacketApi<R: tauri::Runtime = tauri::Wry> {
    pub app_handle: tauri::AppHandle<R>,
    pub device: MeshDevice,
    pub graph_arc: Arc<Mutex<MeshGraph>>,
}

impl<R: tauri::Runtime> MeshPacketApi<R> {
    pub fn new(
        app_handle: tauri::AppHandle<R>,
        device: MeshDevice,
        graph_arc: Arc<Mutex<MeshGraph>>,
    ) -> Self {
        Self {
            app_handle,
            device,
            graph_arc,
        }
    }
}
