use std::time::Duration;

use chrono::NaiveDateTime;
use meshtastic::{
    protobufs::Neighbor,
    ts::specta::{self, Type},
};
use serde::{Deserialize, Serialize};

#[derive(
    Debug, Clone, Serialize, Deserialize, Copy, Hash, PartialEq, Eq, PartialOrd, Ord, Type,
)]
#[serde(rename_all = "camelCase")]
pub struct GraphNode {
    pub node_num: u32,
    pub last_heard: NaiveDateTime,
    pub timeout_duration: Duration,
}

impl From<Neighbor> for GraphNode {
    fn from(neighbor: Neighbor) -> Self {
        Self {
            node_num: neighbor.node_id,
            last_heard: NaiveDateTime::from_timestamp_millis((neighbor.last_rx_time * 1000) as i64)
                .expect("Failed to convert timestamp to NaiveDateTime"),
            timeout_duration: Duration::from_secs(neighbor.node_broadcast_interval_secs as u64),
        }
    }
}
