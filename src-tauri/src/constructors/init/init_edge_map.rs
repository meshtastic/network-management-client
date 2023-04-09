use app::protobufs::{Neighbor, NeighborInfo};
use log::{info, warn};
use std::collections::HashMap;

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

/*
* We're given a HashMap of NeighborInfo packets, each of which is considered to be the most up-to-date
* edge info we have for a node. When we create edges, we want to keep this idea of freshness in mind. If
* a node reports an edge, but a more recent packet from the other node does not report the edge, we want to
* report the edge as dropped and not add it to our list.
*
* returns a hashmap is of form (node_id_1, node_id_2) -> (SNR, timestamp).
*
* This is an O(n^2) algorithm, but our graph is small. Should be reworked at some point.
 */
pub fn init_edge_map(
    neighbors: &HashMap<u32, NeighborInfo>,
) -> HashMap<(u32, u32), GraphEdgeMetadata> {
    let mut snr_hashmap = HashMap::<(u32, u32), GraphEdgeMetadata>::new();
    for neighbor_packet in neighbors.values() {
        let node_id_1 = neighbor_packet.node_id;
        for neighbor in &neighbor_packet.neighbors {
            let node_id_2 = neighbor.node_id;

            snr_hashmap.insert(
                as_key(node_id_1, node_id_2),
                GraphEdgeMetadata::new(neighbor.snr, neighbor.rx_time),
            );

            let opposite_neighbor = check_other_node_agrees(node_id_2, node_id_1, neighbors);
            match opposite_neighbor {
                // If the opposite neighbor is found on a recent packet, we take the most recent SNR
                Some(opposite_neighbor) => {
                    let most_recent_data = if neighbor.rx_time > opposite_neighbor.rx_time {
                        neighbor
                    } else {
                        &opposite_neighbor
                    };
                    snr_hashmap.insert(
                        as_key(node_id_1, node_id_2),
                        GraphEdgeMetadata::new(most_recent_data.snr, most_recent_data.rx_time),
                    );
                }
                _ => {
                    // If the opposite neighbor is not found on a recent packet, we check if our packet is most recent
                    let opt_opposite_node = neighbors.get(&node_id_2);
                    match opt_opposite_node {
                        Some(opposite_node) => {
                            // If the other is more recent, we drop the edge
                            if opposite_node.tx_time > neighbor_packet.tx_time {
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
        }
    }
    snr_hashmap
}

/*
* When we have one side of an edge, we need to check the other side to make sure
* that the edge is still valid. If the other side of the edge is not found on a more
* recent packet, we'll assume that the edge has dropped.
* To do that, this function finds the corresponding Neighbor packet for the other node
 */
pub fn check_other_node_agrees(
    node_id: u32,
    neighbor_id: u32,
    neighbors: &HashMap<u32, NeighborInfo>,
) -> Option<Neighbor> {
    let opt_node = neighbors.get(&node_id);
    match opt_node {
        Some(node) => {
            for neighbor in &node.neighbors {
                if neighbor.node_id == neighbor_id {
                    return Some(neighbor.clone());
                }
            }
            None
        }
        _ => None,
    }
}

// helper function to prevent (A, B) (B, A) duplicates in the hashmap
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

    #[test]
    pub fn test_init_edge_map() {
        let neighbor_1 = Neighbor {
            node_id: 1,
            rx_time: 0,
            snr: 1.0,
        };
        let neighbor_2 = Neighbor {
            node_id: 2,
            rx_time: 0,
            snr: 2.0,
        };
        let neighbor_3 = Neighbor {
            node_id: 3,
            rx_time: 0,
            snr: 3.0,
        };
        let neighbor_4 = Neighbor {
            node_id: 4,
            rx_time: 0,
            snr: 4.0,
        };
        let neighbor_info_1 = NeighborInfo {
            node_id: 1,
            tx_time: 0,
            neighbors: vec![neighbor_2.clone(), neighbor_3.clone(), neighbor_4.clone()],
            ..Default::default()
        };
        let neighbor_info_2: NeighborInfo = NeighborInfo {
            node_id: 2,
            tx_time: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_3.clone(), neighbor_4.clone()],
            ..Default::default()
        };
        let neighbor_info_3: NeighborInfo = NeighborInfo {
            node_id: 3,
            tx_time: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_2.clone(), neighbor_4],
            ..Default::default()
        };
        let neighbor_info_4: NeighborInfo = NeighborInfo {
            node_id: 4,
            tx_time: 0,
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
            neighborinfo_hashmap.insert(neighborinfo.node_id, neighborinfo);
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
            rx_time: 0,
            snr: 1.0,
        };
        let neighbor_2 = Neighbor {
            node_id: 2,
            rx_time: 100,
            snr: 2.0,
        };
        let neighbor_info_1 = NeighborInfo {
            node_id: 1,
            tx_time: 0,
            neighbors: vec![neighbor_2],
            ..Default::default()
        };
        let neighbor_info_2: NeighborInfo = NeighborInfo {
            node_id: 2,
            tx_time: 0,
            neighbors: vec![neighbor_1],
            ..Default::default()
        };
        let mut neighborinfo_hashmap = HashMap::new();
        let neighborinfo_vec = vec![neighbor_info_1, neighbor_info_2];
        for neighborinfo in neighborinfo_vec {
            neighborinfo_hashmap.insert(neighborinfo.node_id, neighborinfo);
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
            rx_time: 1,
            snr: 1.0,
        };
        let neighbor_2 = Neighbor {
            node_id: 2,
            rx_time: 2,
            snr: 2.0,
        };
        let neighbor_3 = Neighbor {
            node_id: 3,
            rx_time: 3,
            snr: 3.0,
        };
        let neighbor_4 = Neighbor {
            node_id: 4,
            rx_time: 4,
            snr: 4.0,
        };
        // Start with a full set of neighbors
        let neighbor_info_1 = NeighborInfo {
            node_id: 1,
            tx_time: 0,
            neighbors: vec![neighbor_2.clone(), neighbor_3.clone(), neighbor_4.clone()],
            ..Default::default()
        };
        let neighbor_info_2: NeighborInfo = NeighborInfo {
            node_id: 2,
            tx_time: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_3.clone(), neighbor_4.clone()],
            ..Default::default()
        };
        let neighbor_info_3: NeighborInfo = NeighborInfo {
            node_id: 3,
            tx_time: 0,
            neighbors: vec![neighbor_1, neighbor_2.clone(), neighbor_4],
            ..Default::default()
        };
        // Drop a neighbor
        let neighbor_info_4: NeighborInfo = NeighborInfo {
            node_id: 4,
            tx_time: 100,
            neighbors: vec![neighbor_2, neighbor_3],
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
            neighborinfo_hashmap.insert(neighborinfo.node_id, neighborinfo);
        }
        println!("neighborinfo_hashmap: {:?}", neighborinfo_hashmap);
        let snr_hashmap = init_edge_map(&neighborinfo_hashmap);
        println!("snr_hashmap: {:?}", snr_hashmap);
        assert_eq!(snr_hashmap.len(), 5);
    }
}
