use std::sync::Arc;

// use meshtastic::connections::stream_api::{state::Configured, StreamApi};
use tokio::sync::Mutex;

use crate::{device::MeshDevice, graph::ds::graph::MeshGraph};

pub mod handlers;
pub mod router;

#[derive(Debug)]
pub struct MeshPacketApi {
    pub device: MeshDevice,
    // pub graph: Arc<Mutex<MeshGraph>>,
}

impl MeshPacketApi {
    pub fn new(device: MeshDevice) -> Self {
        Self { device }
    }
}
