use super::edge_factory::edge_factory;
use super::take_snapshot::total_distance;
use crate::aux_data_structures::neighbor_info::{Neighbor, NeighborInfo};
use crate::aux_functions::conversion_factors::*;
use crate::graph::graph_ds::Graph;
use crate::mesh::device::MeshNode;
use app::protobufs;
use petgraph::graph::NodeIndex;
use std::collections::HashMap;

pub fn init_node_map(meshnode_vec: Vec<MeshNode>) -> HashMap<u32, MeshNode> {
    let mut loc_hashmap: HashMap<u32, MeshNode> = HashMap::new();
    for meshnode in meshnode_vec {
        let node_id = meshnode.data.num;
        loc_hashmap.insert(node_id as u32, meshnode);
    }
    loc_hashmap
}

#[cfg(test)]
mod tests {
    use super::*;
}
