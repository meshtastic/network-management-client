use std::time::Duration;

use chrono::NaiveDateTime;
use meshtastic::{
    protobufs::Neighbor,
    ts::specta::{self, Type},
};
use serde::{Deserialize, Serialize};

use crate::graph::api::update_from_packet::DEFAULT_NODE_TIMEOUT_DURATION;

#[derive(Debug, Clone, Serialize, Deserialize, Copy, Hash, PartialOrd, Ord, Type)]
#[serde(rename_all = "camelCase")]
pub struct GraphNode {
    pub node_num: u32,
    pub last_heard: NaiveDateTime,
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

impl From<Neighbor> for GraphNode {
    fn from(neighbor: Neighbor) -> Self {
        let timeout_secs: u64 = if neighbor.node_broadcast_interval_secs == 0 {
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
            last_heard: NaiveDateTime::from_timestamp_millis(last_heard_secs * 1000)
                .expect("Failed to convert timestamp to NaiveDateTime"),
            timeout_duration: Duration::from_secs(timeout_secs),
        }
    }
}
