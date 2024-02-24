use std::sync::Arc;

// use meshtastic::connections::stream_api::{state::Configured, StreamApi};
use tokio::sync::Mutex;

use crate::{device::MeshDevice, graph::ds::graph::MeshGraph};

pub mod handlers;
pub mod router;

pub struct MeshPacketApi {
    pub device: MeshDevice,
    pub graph_arc: Arc<Mutex<MeshGraph>>,
}

impl MeshPacketApi {
    pub fn new(device: MeshDevice, graph_arc: Arc<Mutex<MeshGraph>>) -> Self {
        Self { device, graph_arc }
    }
}
