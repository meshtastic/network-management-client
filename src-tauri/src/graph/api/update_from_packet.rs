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

        let own_node = GraphNode {
            node_num: packet.from,
            last_heard: chrono::Utc::now().naive_utc(),
            timeout_duration: DEFAULT_NODE_TIMEOUT_DURATION,
        };

        self.add_node(own_node.clone());

        // Update neighbor nodes
        // TODO: only update if the nodes are already in the graph
        for neighbor in neighbor_info.neighbors {
            log::info!("Adding neighbor node {} to graph", neighbor.node_id);

            let remote_node: GraphNode = neighbor.clone().into();

            self.add_node(remote_node);

            self.add_edge(
                own_node.clone(),
                remote_node,
                GraphEdge::from_neighbor(own_node.node_num, neighbor),
            );
        }
    }

    pub fn update_from_node_info(&mut self, node_info: protobufs::NodeInfo) {
        log::info!(
            "Updating graph from node info packet from node {}",
            node_info.num
        );

        let updated_graph_node = match self.get_node(node_info.num) {
            Some(mut graph_node) => {
                graph_node.last_heard = chrono::Utc::now().naive_utc();
                graph_node
            }
            None => {
                let new_graph_node = GraphNode {
                    node_num: node_info.num,
                    last_heard: chrono::Utc::now().naive_utc(),
                    timeout_duration: DEFAULT_NODE_TIMEOUT_DURATION,
                };
                new_graph_node
            }
        };

        self.update_node(updated_graph_node);
    }

    pub fn update_from_position(&mut self, packet: MeshPacket, _position: protobufs::Position) {
        log::info!(
            "Updating graph from position packet from node {}",
            packet.from
        );

        // * Unused, graph doesn't hold position
    }
}
