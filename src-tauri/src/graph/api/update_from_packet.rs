use std::time::Duration;

use meshtastic::protobufs::{self, MeshPacket};

use crate::graph::ds::{edge::GraphEdge, graph::MeshGraph, node::GraphNode};

pub const DEFAULT_NODE_TIMEOUT_DURATION: Duration = Duration::from_secs(15 * 60);

impl MeshGraph {
    pub fn update_from_neighbor_info(
        &mut self,
        packet: MeshPacket,
        neighbor_info: protobufs::NeighborInfo,
    ) {
        log::info!(
            "Updating graph from neighbor info packet from node {}",
            packet.from
        );

        // Update own node

        let own_node = match self.get_node(packet.from) {
            Some(node) => GraphNode {
                last_heard: chrono::Utc::now().naive_utc(),
                ..node
            },
            None => neighbor_info.clone().into(),
        };

        self.upsert_node(own_node.clone());

        // Update neighbor nodes, don't insert as this isn't how neighbor info works
        for neighbor in neighbor_info.neighbors {
            log::info!("Adding neighbor node {} to graph", neighbor.node_id);

            let remote_node = match self.get_node(neighbor.node_id) {
                Some(g) => g,
                None => {
                    continue;
                }
            };

            self.upsert_edge(
                own_node.clone(),
                remote_node,
                GraphEdge::from_neighbor(own_node.node_num, neighbor),
            );
        }
    }

    pub fn update_from_position(&mut self, packet: MeshPacket, _position: protobufs::Position) {
        log::info!(
            "Updating graph from position packet from node {}",
            packet.from
        );

        let own_node = match self.get_node(packet.from) {
            Some(node) => GraphNode {
                last_heard: chrono::Utc::now().naive_utc(),
                ..node
            },
            None => GraphNode {
                node_num: packet.from,
                last_heard: chrono::Utc::now().naive_utc(),
                timeout_duration: DEFAULT_NODE_TIMEOUT_DURATION,
            },
        };

        self.upsert_node(own_node);
    }
}
