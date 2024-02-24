use petgraph::graphmap::GraphMap;

use super::{edge, node};

#[derive(Clone)]
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
