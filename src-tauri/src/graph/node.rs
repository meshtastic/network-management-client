use serde::{Deserialize, Serialize};

use crate::state::NodeKey;
#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct Node {
    pub num: u32,
    pub optimal_weighted_degree: f64,
    pub longitude: f64,
    pub latitude: f64,
    pub altitude: f64,
    pub speed: f64,
    pub direction: f64,
}

impl Node {
    pub fn new(num: NodeKey) -> Node {
        Node {
            num,
            ..Default::default()
        }
    }
}

// Add equality operator to Node
impl std::cmp::Eq for Node {}

// Add partial equality operator to Node
impl std::cmp::PartialEq for Node {
    fn eq(&self, other: &Self) -> bool {
        self.num == other.num
    }
}

// TODO idk if we need these, they feel weird

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
