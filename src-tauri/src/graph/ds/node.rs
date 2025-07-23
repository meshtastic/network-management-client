use std::time::Duration;

use chrono::{DateTime, Utc};
use log::trace;
use meshtastic::{
    protobufs::{self, Neighbor},
    ts::specta::{self, Type},
};
use serde::{Deserialize, Serialize};

use crate::graph::api::update_from_packet::DEFAULT_NODE_TIMEOUT_DURATION;

#[derive(Debug, Clone, Serialize, Deserialize, Copy, Hash, PartialOrd, Ord, Type)]
#[serde(rename_all = "camelCase")]
pub struct GraphNode {
    pub node_num: u32,
    pub last_heard: DateTime<Utc>,
    pub timeout_duration: Duration,
}

impl PartialEq<GraphNode> for GraphNode {
    fn eq(&self, other: &GraphNode) -> bool {
        self.node_num == other.node_num
    }
}

impl PartialEq<u32> for GraphNode {
    fn eq(&self, other: &u32) -> bool {
        self.node_num == *other
    }
}

impl Eq for GraphNode {}

impl From<protobufs::NeighborInfo> for GraphNode {
    fn from(neighbor_info: protobufs::NeighborInfo) -> Self {
        let timeout_secs: u64 = if neighbor_info.node_broadcast_interval_secs == 0 {
            trace!(
                "Using default node timeout duration for neighbor info from node {}",
                neighbor_info.node_id
            );
            DEFAULT_NODE_TIMEOUT_DURATION.as_secs()
        } else {
            neighbor_info.node_broadcast_interval_secs as u64
        };

        log::debug!(
            "Updating node from neighbor info {}, timing out in {} seconds",
            neighbor_info.node_id,
            timeout_secs
        );

        Self {
            node_num: neighbor_info.node_id,
            last_heard: DateTime::from_timestamp_millis(chrono::Utc::now().timestamp_millis())
                .expect("Failed to convert timestamp to DateTime"),
            timeout_duration: Duration::from_secs(timeout_secs),
        }
    }
}

impl From<Neighbor> for GraphNode {
    fn from(neighbor: Neighbor) -> Self {
        let timeout_secs: u64 = if neighbor.node_broadcast_interval_secs == 0 {
            trace!(
                "Using default node timeout duration for neighbor from node {}",
                neighbor.node_id
            );
            DEFAULT_NODE_TIMEOUT_DURATION.as_secs()
        } else {
            neighbor.node_broadcast_interval_secs as u64
        };

        let last_heard_secs: i64 = if neighbor.last_rx_time == 0 {
            chrono::Utc::now().timestamp()
        } else {
            neighbor.last_rx_time as i64
        };

        log::debug!(
            "Updating node from neighbor {}, timing out in {} seconds",
            neighbor.node_id,
            timeout_secs
        );

        Self {
            node_num: neighbor.node_id,
            last_heard: DateTime::from_timestamp_millis(last_heard_secs * 1000)
                .expect("Failed to convert timestamp to DateTime"),
            timeout_duration: Duration::from_secs(timeout_secs),
        }
    }
}
