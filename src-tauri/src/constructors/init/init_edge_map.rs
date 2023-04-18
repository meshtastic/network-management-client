use app::protobufs::Neighbor;
use log::{info, warn};
use std::collections::HashMap;

use crate::mesh::device::NeighborInfoPacket;

#[derive(Clone, Debug)]
pub struct GraphEdgeMetadata {
    pub snr: f64,
    pub timestamp: u64,
}

impl GraphEdgeMetadata {
    fn new(snr: impl Into<f64>, timestamp: impl Into<u64>) -> Self {
        Self {
            snr: snr.into(),
            timestamp: timestamp.into(),
        }
    }
}

/// We're given a HashMap of NeighborInfo packets, each of which is considered to be the most up-to-date
/// edge info we have for a node. When we create edges, we want to keep this idea of freshness in mind. If
/// a node reports an edge, but a more recent packet from the other node does not report the edge, we want to
/// report the edge as dropped and not add it to our list.
///
/// returns a hashmap is of form (node_id_1, node_id_2) -> (SNR, timestamp).
///
/// This is an O(n^2) algorithm, but our graph is small. Should be reworked at some point.
pub fn init_edge_map(
    neighbors: &HashMap<u32, NeighborInfoPacket>,
) -> HashMap<(u32, u32), GraphEdgeMetadata> {
    let mut snr_hashmap = HashMap::<(u32, u32), GraphEdgeMetadata>::new();

    // For all stored neighbor info packets
    for neighbor_packet in neighbors.values() {
        let node_id_1 = neighbor_packet.data.node_id;

        // For all neighbors in each packet
        for neighbor in &neighbor_packet.data.neighbors {
            let node_id_2 = neighbor.node_id;

            // Insert each edge into the SNR map
            snr_hashmap.insert(
                as_key(node_id_1, node_id_2),
                GraphEdgeMetadata::new(neighbor.snr, neighbor_packet.packet.rx_time),
            );

            // Check that the edge (node_id_2, node_id_1) has been heard from
            // If the opposite neighbor is found on a recent packet, we take the most recent SNR
            if let Some(opposite_neighbor) =
                check_other_node_agrees(node_id_2, node_id_1, neighbors)
            {
                let opposite_packet = neighbors.get(&opposite_neighbor.node_id).unwrap();
                let own_packet = neighbors.get(&neighbor.node_id).unwrap();

                let most_recent_data = if own_packet.packet.rx_time > opposite_packet.packet.rx_time
                {
                    neighbor
                } else {
                    &opposite_neighbor
                };

                snr_hashmap.insert(
                    as_key(node_id_1, node_id_2),
                    GraphEdgeMetadata::new(most_recent_data.snr, neighbor_packet.packet.rx_time),
                );

                continue;
            }

            // If the opposite neighbor is not found on a recent packet, we check if our packet is most recent
            let opt_opposite_node = neighbors.get(&node_id_2);
            match opt_opposite_node {
                Some(opposite_node) => {
                    // If the other is more recent, we drop the edge
                    if opposite_node.packet.rx_time > neighbor_packet.packet.rx_time {
                        info!("{} -> {} is a dropped edge", node_id_1, node_id_2);
                        if snr_hashmap.contains_key(&as_key(node_id_1, node_id_2)) {
                            snr_hashmap.remove(&as_key(node_id_1, node_id_2));
                        }
                    }
                }
                _ => {
                    // If the other node is not found in the neighbors hashmap, we don't add the edge (drop it)
                    warn!("{} not found in neighbors", node_id_2);
                }
            }
        }
    }
    snr_hashmap
}

/// When we have one side of an edge, we need to check the other side to make sure
/// that the edge is still valid. If the other side of the edge is not found on a more
/// recent packet, we'll assume that the edge has dropped.
/// To do that, this function finds the corresponding Neighbor packet for the other node
pub fn check_other_node_agrees(
    own_id: u32,
    neighbor_id: u32,
    neighbors: &HashMap<u32, NeighborInfoPacket>,
) -> Option<Neighbor> {
    let own_packet = neighbors.get(&own_id)?;
    let own_neighbors = &own_packet.data.neighbors;

    let found_neighbor = own_neighbors
        .iter()
        .find(|n| n.node_id == neighbor_id)?
        .clone();

    Some(found_neighbor)
}

/// A helper function to prevent (A, B) (B, A) duplicates in the hashmap
/// by ensuring that A < B (assuming A != B)
pub fn as_key(node_1: u32, node_2: u32) -> (u32, u32) {
    if node_1 < node_2 {
        (node_1, node_2)
    } else {
        (node_2, node_1)
    }
}

#[cfg(test)]
mod tests {
    use app::protobufs::{MeshPacket, Neighbor, NeighborInfo};

    use super::*;

    #[test]
    pub fn test_init_edge_map() {
        let neighbor_1 = Neighbor {
            node_id: 1,
            snr: 1.0,
        };

        let neighbor_2 = Neighbor {
            node_id: 2,
            snr: 2.0,
        };

        let neighbor_3 = Neighbor {
            node_id: 3,
            snr: 3.0,
        };

        let neighbor_4 = Neighbor {
            node_id: 4,
            snr: 4.0,
        };

        let neighbor_info_1 = NeighborInfo {
            node_id: 1,
            neighbors: vec![neighbor_2.clone(), neighbor_3.clone(), neighbor_4.clone()],
            ..Default::default()
        };

        let neighbor_info_2 = NeighborInfo {
            node_id: 2,
            neighbors: vec![neighbor_1.clone(), neighbor_3.clone(), neighbor_4.clone()],
            ..Default::default()
        };

        let neighbor_info_3 = NeighborInfo {
            node_id: 3,
            neighbors: vec![neighbor_1.clone(), neighbor_2.clone(), neighbor_4],
            ..Default::default()
        };

        let neighbor_info_4 = NeighborInfo {
            node_id: 4,
            neighbors: vec![neighbor_1, neighbor_2, neighbor_3],
            ..Default::default()
        };

        let neighborinfo_vec = vec![
            neighbor_info_1,
            neighbor_info_2,
            neighbor_info_3,
            neighbor_info_4,
        ];

        let mut neighborinfo_hashmap = HashMap::new();
        for neighborinfo in neighborinfo_vec {
            neighborinfo_hashmap.insert(
                neighborinfo.node_id,
                NeighborInfoPacket {
                    data: neighborinfo,
                    ..Default::default()
                },
            );
        }

        println!("neighborinfo_hashmap: {:?}", neighborinfo_hashmap);
        let snr_hashmap = init_edge_map(&neighborinfo_hashmap);
        println!("snr_hashmap: {:?}", snr_hashmap);
        assert_eq!(snr_hashmap.len(), 6);
    }

    #[test]
    fn test_prioritize_recent_snr() {
        let neighbor_1 = Neighbor {
            node_id: 1,
            snr: 1.0,
        };

        let neighbor_2 = Neighbor {
            node_id: 2,
            snr: 2.0,
        };

        let neighbor_info_1 = NeighborInfo {
            node_id: 1,
            neighbors: vec![neighbor_2],
            ..Default::default()
        };

        let neighbor_info_2: NeighborInfo = NeighborInfo {
            node_id: 2,
            neighbors: vec![neighbor_1],
            ..Default::default()
        };

        let neighborinfo_vec = vec![neighbor_info_1, neighbor_info_2];

        let mut neighborinfo_hashmap = HashMap::new();
        for neighborinfo in neighborinfo_vec {
            neighborinfo_hashmap.insert(
                neighborinfo.node_id,
                NeighborInfoPacket {
                    data: neighborinfo,
                    ..Default::default()
                },
            );
        }

        let snr_hashmap = init_edge_map(&neighborinfo_hashmap);
        println!("snr_hashmap: {:?}", snr_hashmap);
        assert_eq!(snr_hashmap.len(), 1);
        assert_eq!(snr_hashmap.get(&as_key(1, 2)).unwrap().snr, 2.0);
    }

    #[test]
    pub fn test_edge_drop_off() {
        let neighbor_1 = Neighbor {
            node_id: 1,
            snr: 1.0,
        };

        let neighbor_2 = Neighbor {
            node_id: 2,
            snr: 2.0,
        };

        let neighbor_3 = Neighbor {
            node_id: 3,
            snr: 3.0,
        };

        let neighbor_4 = Neighbor {
            node_id: 4,
            snr: 4.0,
        };

        let packet_1 = MeshPacket {
            rx_time: 1,
            ..Default::default()
        };

        let packet_2 = MeshPacket {
            rx_time: 2,
            ..Default::default()
        };

        let packet_3 = MeshPacket {
            rx_time: 3,
            ..Default::default()
        };

        let packet_4 = MeshPacket {
            rx_time: 4,
            ..Default::default()
        };

        // Start with a full set of neighbors
        let neighbor_info_1 = NeighborInfo {
            node_id: 1,
            neighbors: vec![neighbor_2.clone(), neighbor_3.clone(), neighbor_4.clone()],
            ..Default::default()
        };

        let neighbor_info_2: NeighborInfo = NeighborInfo {
            node_id: 2,
            neighbors: vec![neighbor_1.clone(), neighbor_3.clone(), neighbor_4.clone()],
            ..Default::default()
        };

        let neighbor_info_3: NeighborInfo = NeighborInfo {
            node_id: 3,
            neighbors: vec![neighbor_1, neighbor_2.clone(), neighbor_4],
            ..Default::default()
        };

        // Drop a neighbor
        let neighbor_info_4: NeighborInfo = NeighborInfo {
            node_id: 4,
            neighbors: vec![neighbor_2, neighbor_3],
            ..Default::default()
        };

        let neighborinfo_vec = vec![
            (neighbor_info_1, packet_1),
            (neighbor_info_2, packet_2),
            (neighbor_info_3, packet_3),
            (neighbor_info_4, packet_4),
        ];

        let mut neighborinfo_hashmap = HashMap::new();
        for (neighborinfo, packet) in neighborinfo_vec {
            neighborinfo_hashmap.insert(
                neighborinfo.node_id,
                NeighborInfoPacket {
                    data: neighborinfo,
                    packet,
                },
            );
        }

        println!("neighborinfo_hashmap: {:#?}", neighborinfo_hashmap);
        let snr_hashmap = init_edge_map(&neighborinfo_hashmap);
        println!("snr_hashmap: {:#?}", snr_hashmap);
        assert_eq!(snr_hashmap.len(), 5);
    }
}
