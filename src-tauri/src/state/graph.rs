use std::sync::{Arc, Mutex};

use crate::graph::ds::graph::MeshGraph;

pub type GraphStateInner = Arc<Mutex<MeshGraph>>;

pub struct GraphState {
    pub inner: GraphStateInner,
}

impl GraphState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(MeshGraph::new())),
        }
    }
}
