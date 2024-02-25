use meshtastic::protobufs;

use super::ds::graph::MeshGraph;

impl MeshGraph {
    pub fn update_from_neighbor_info(&mut self, neighbor_info: protobufs::NeighborInfo) {}

    pub fn update_from_node_info(&mut self, node_info: protobufs::NodeInfo) {}

    pub fn update_from_position(&mut self, position: protobufs::Position) {}
}
