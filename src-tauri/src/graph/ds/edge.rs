use std::time::Duration;

use chrono::{DateTime, Utc};
use log::trace;
use meshtastic::{
    protobufs::Neighbor,
    ts::specta::{self, Type},
};
use serde::{Deserialize, Serialize};

use crate::graph::api::update_from_packet::DEFAULT_NODE_TIMEOUT_DURATION;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GraphEdge {
    snr: f64,
    from: u32,
    to: u32,
    pub last_heard: DateTime<Utc>,
    pub timeout_duration: Duration,
}

impl GraphEdge {
    pub fn from_neighbor(to_node_id: u32, neighbor: Neighbor) -> Self {
        let timeout_secs: u64 = if neighbor.node_broadcast_interval_secs == 0 {
            trace!(
                "Using default edge timeout duration for edge between {} and {}",
                neighbor.node_id,
                to_node_id
            );
            DEFAULT_NODE_TIMEOUT_DURATION.as_secs()
        } else {
            neighbor.node_broadcast_interval_secs as u64
        };

        log::debug!(
            "Creating edge from neighbor between {} to {}, timing out in {} seconds",
            neighbor.node_id,
            to_node_id,
            timeout_secs
        );

        Self {
            snr: neighbor.snr.into(),
            from: neighbor.node_id,
            to: to_node_id,
            last_heard: chrono::Utc::now(),
            timeout_duration: Duration::from_secs(timeout_secs),
        }
    }
}
