use meshtastic::protobufs::{self, MeshPacket};

use crate::graph::ds::{edge::GraphEdge, node::GraphNode};

use super::ds::graph::MeshGraph;

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
            timeout_duration: std::time::Duration::from_secs(30),
        };

        self.graph.add_node(own_node.clone());

        // Update neighbor nodes
        // TODO: only update if the nodes are already in the graph
        for neighbor in neighbor_info.neighbors {
            log::info!("Adding neighbor node {} to graph", neighbor.node_id);

            let remote_node: GraphNode = neighbor.clone().into();

            self.graph.add_node(remote_node);

            self.graph.add_edge(
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

        // Currently not using this
    }

    pub fn update_from_position(&mut self, packet: MeshPacket, _position: protobufs::Position) {
        log::info!(
            "Updating graph from position packet from node {}",
            packet.from
        );

        // Currently not using this
    }
}
