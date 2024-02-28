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
}

impl GraphEdge {
    pub fn from_neighbor(to_node_id: u32, neighbor: Neighbor) -> Self {
        Self {
            snr: neighbor.snr.into(),
            from: neighbor.node_id,
            to: to_node_id,
        }
    }
}
