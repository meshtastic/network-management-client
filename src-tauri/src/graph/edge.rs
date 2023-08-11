use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GraphEdge {
    pub source: petgraph::graph::NodeIndex,
    pub target: petgraph::graph::NodeIndex,
    pub weight: f64,
}

// Add hash operator to Edge
impl std::hash::Hash for GraphEdge {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.source.hash(state);
        self.target.hash(state);
    }
}

impl GraphEdge {
    pub fn new(
        source: petgraph::graph::NodeIndex,
        target: petgraph::graph::NodeIndex,
        weight: f64,
    ) -> GraphEdge {
        GraphEdge {
            source,
            target,
            weight,
        }
    }

    pub fn get_source(&self) -> petgraph::graph::NodeIndex {
        self.source
    }

    pub fn get_target(&self) -> petgraph::graph::NodeIndex {
        self.target
    }

    pub fn get_weight(&self) -> f64 {
        self.weight
    }
}

/// Add clone trait to Edge
impl Clone for GraphEdge {
    fn clone(&self) -> Self {
        GraphEdge {
            source: self.source,
            target: self.target,
            weight: self.weight,
        }
    }
}

/// Add eq operator to Edge
impl std::cmp::Eq for GraphEdge {}

/// Add equality operator to Edge
impl PartialEq for GraphEdge {
    fn eq(&self, other: &Self) -> bool {
        self.source == other.source && self.target == other.target
    }
}
