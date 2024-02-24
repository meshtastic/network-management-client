use std::sync::Arc;
use tauri::async_runtime;

use crate::graph::ds::graph::MeshGraph;

pub type GraphStateInner = Arc<async_runtime::Mutex<MeshGraph>>;

pub struct GraphState {
    pub inner: GraphStateInner,
}

impl GraphState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(async_runtime::Mutex::new(MeshGraph::new())),
        }
    }
}
