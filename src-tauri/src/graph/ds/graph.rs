use petgraph::graphmap::GraphMap;
use serde::{Deserialize, Serialize};

use super::{edge, node};

#[derive(Clone, Serialize, Deserialize)]

pub struct MeshGraph {
    pub graph: GraphMap<node::GraphNode, edge::GraphEdge, petgraph::Directed>,
}

impl MeshGraph {
    pub fn new() -> Self {
        Self {
            graph: GraphMap::new(),
        }
    }
}
