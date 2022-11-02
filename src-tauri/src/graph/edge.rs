#[derive(Debug)]
pub struct Edge {
    pub u: petgraph::graph::NodeIndex,
    pub v: petgraph::graph::NodeIndex,
    pub weight: f64,
}

// Add hash operator to Edge
impl std::hash::Hash for Edge {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.u.hash(state);
        self.v.hash(state);
    }
}

impl Edge {
    pub fn new(u: petgraph::graph::NodeIndex, v: petgraph::graph::NodeIndex, weight: f64) -> Edge {
        Edge { u, v, weight }
    }
}

/// Add clone trait to Edge
impl Clone for Edge {
    fn clone(&self) -> Self {
        Edge {
            u: self.u.clone(),
            v: self.v.clone(),
            weight: self.weight,
        }
    }
}

/// Add eq operator to Edge
impl std::cmp::Eq for Edge {}

/// Add equality operator to Edge
impl PartialEq for Edge {
    fn eq(&self, other: &Self) -> bool {
        self.u == other.u && self.v == other.v
    }
}
