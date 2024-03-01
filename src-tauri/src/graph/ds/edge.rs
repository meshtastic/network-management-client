use std::time::Duration;

use chrono::NaiveDateTime;
use meshtastic::{
    protobufs::Neighbor,
    ts::specta::{self, Type},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GraphEdge {
    snr: f64,
    from: u32,
    to: u32,
    pub last_heard: NaiveDateTime,
    pub timeout_duration: Duration,
}

impl GraphEdge {
    pub fn from_neighbor(to_node_id: u32, neighbor: Neighbor) -> Self {
        Self {
            snr: neighbor.snr.into(),
            from: neighbor.node_id,
            to: to_node_id,
            last_heard: chrono::Utc::now().naive_utc(),
            timeout_duration: Duration::from_secs(neighbor.node_broadcast_interval_secs as u64),
        }
    }
}
