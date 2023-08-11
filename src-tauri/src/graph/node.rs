use std::time::Duration;

use app::protobufs;
use serde::{Deserialize, Serialize};

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct GraphNode {
    pub num: u32,
    pub optimal_weighted_degree: f64,
    pub longitude: f64,
    pub latitude: f64,
    pub altitude: f64,
    pub speed: f64,
    pub direction: f64,
    pub broadcast_interval: Duration,
}

impl GraphNode {
    pub fn new(num: u32, broadcast_interval: Duration) -> Self {
        GraphNode {
            num,
            broadcast_interval,
            ..Default::default()
        }
    }
}

impl From<protobufs::NeighborInfo> for GraphNode {
    fn from(value: protobufs::NeighborInfo) -> Self {
        GraphNode {
            num: value.node_id,
            broadcast_interval: Duration::from_secs(value.node_broadcast_interval_secs.into()),
            ..Default::default()
        }
    }
}

impl From<protobufs::Neighbor> for GraphNode {
    fn from(value: protobufs::Neighbor) -> Self {
        GraphNode {
            num: value.node_id,
            broadcast_interval: Duration::from_secs(value.node_broadcast_interval_secs.into()),
            ..Default::default()
        }
    }
}

// Add equality operator to Node
impl std::cmp::Eq for GraphNode {}

// Add partial equality operator to Node
impl std::cmp::PartialEq for GraphNode {
    fn eq(&self, other: &Self) -> bool {
        self.num == other.num
    }
}

// TODO idk if we need these, they feel weird

// Add partial ordering operator to Node using optimal_weighted_degree
impl std::cmp::PartialOrd for GraphNode {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.optimal_weighted_degree
            .partial_cmp(&other.optimal_weighted_degree)
    }
}

// Add Ord trait to Node using optimal_weighted_degree
impl std::cmp::Ord for GraphNode {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.optimal_weighted_degree
            .partial_cmp(&other.optimal_weighted_degree)
            .unwrap()
    }
}
