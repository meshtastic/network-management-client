#[derive(Debug)]
pub struct Node {
    pub name: String,
    pub optimal_weighted_degree: f64,
}

impl Node {
    pub fn new(name: String) -> Node {
        Node {
            name,
            optimal_weighted_degree: 0.0,
        }
    }
}

/// Add clone trait to Node
impl Clone for Node {
    fn clone(&self) -> Self {
        Node {
            name: self.name.clone(),
            optimal_weighted_degree: self.optimal_weighted_degree,
        }
    }
}

/// Add hash to Node so that we can use it as a key in a HashMap
impl std::hash::Hash for Node {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.name.hash(state);
    }
}

// Add equality operator to Node
impl std::cmp::Eq for Node {}

// Add partial equality operator to Node
impl std::cmp::PartialEq for Node {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
    }
}

// Add partial ordering operator to Node using optimal_weighted_degree
impl std::cmp::PartialOrd for Node {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.optimal_weighted_degree
            .partial_cmp(&other.optimal_weighted_degree)
    }
}

// Add Ord trait to Node using optimal_weighted_degree
impl std::cmp::Ord for Node {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.optimal_weighted_degree
            .partial_cmp(&other.optimal_weighted_degree)
            .unwrap()
    }
}
