use std::time::Duration;

uschrono::NaiveDateTime;
use meshtastic::ts::specta::{self, Type};
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
