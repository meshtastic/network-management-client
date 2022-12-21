use redux_rs::Selector;
use serde::{Deserialize, Serialize};
use std::collections::LinkedList;

use app::protobufs;

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MessagesState {
    mesh_packets: LinkedList<protobufs::MeshPacket>,
}

#[derive(Clone, Debug)]
pub enum MeshPacketActions {
    AddPacket { packet: protobufs::MeshPacket },
}

pub fn message_reducer(mut state: MessagesState, action: MeshPacketActions) -> MessagesState {
    match action {
        MeshPacketActions::AddPacket { packet } => MessagesState {
            mesh_packets: {
                state.mesh_packets.push_back(packet);

                if state.mesh_packets.len() >= 256 {
                    state.mesh_packets.pop_front();
                }

                state.mesh_packets
            },
            ..state
        },
    }
}

pub struct SelectAllMessages;
impl Selector<MessagesState> for SelectAllMessages {
    type Result = Vec<protobufs::MeshPacket>;

    fn select(&self, state: &MessagesState) -> Self::Result {
        state.mesh_packets.iter().map(|e| e.to_owned()).collect()
    }
}
