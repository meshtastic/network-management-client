use serde::{Deserialize, Serialize};
use std::collections::LinkedList;

use app::protobufs;

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MessagesState {
    pub mesh_packets: LinkedList<protobufs::MeshPacket>,
}

impl MessagesState {
    pub fn new() -> Self {
        MessagesState {
            mesh_packets: LinkedList::new(),
        }
    }
}
