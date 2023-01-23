use super::edge_factory::edge_factory;
use super::take_snapshot::total_distance;
use crate::aux_data_structures::neighbor_info::{Neighbor, NeighborInfo};
use crate::aux_functions::conversion_factors::*;
use crate::graph::graph_ds::Graph;
use crate::mesh::device::MeshNode;
use app::protobufs;
use petgraph::graph::NodeIndex;
use std::collections::HashMap;

pub fn init_edge_map(packets: Vec<NeighborInfo>) -> HashMap<(u32, u32), (f64, u64)> {
    let mut snr_hashmap = HashMap::<(u32, u32), (f64, u64)>::new();
    for node_packet in packets {
        let node_id = node_packet.id;
        add_node_to_graph_if_not_exists(&mut graph, node_id);
        for neighbor_packet in node_packet.neighbors {
            let neighbor_id = neighbor_packet.id;
            add_node_to_graph_if_not_exists(&mut graph, neighbor_id);
            // Check if the edge is already in the hashmap
            let edge_exists = snr_hashmap.contains_key(&as_key(node_id, neighbor_id));
            if edge_exists {
                let edge_snr_time = snr_hashmap.get(&as_key(node_id, neighbor_id)).unwrap();
                let hashmap_timestamp = edge_snr_time.1;
                // Replace the edge if the new timestamp is more recent (larger)
                if hashmap_timestamp < neighbor_packet.timestamp {
                    snr_hashmap.insert(
                        as_key(node_id, neighbor_id),
                        (neighbor_packet.snr, neighbor_packet.timestamp),
                    );
                }
            } else {
                snr_hashmap.insert(
                    as_key(node_id, neighbor_id),
                    (neighbor_packet.snr, neighbor_packet.timestamp),
                );
            }
        }
    }
    snr_hashmap
}

pub fn as_key(node_1: u32, node_2: u32) -> (u32, u32) {
    if node_1 < node_2 {
        (node_1, node_2)
    } else {
        (node_2, node_1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
}
