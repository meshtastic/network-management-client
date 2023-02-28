use app::protobufs::{Neighbor, NeighborInfo};
use std::collections::HashMap;

/*
* Create a hashmap of edges and their SNR values from a vector of NeighborInfo packets.
* When we have a conflict between two nodes reporting the same edge, we take the most recent
* timestamp as fact (if the most recently updated node does not report the edge, we remove it).
* @returns a hashmap is of form (node_id_1, node_id_2) -> (SNR, timestamp).
 */
pub fn init_edge_map(neighbors: HashMap<u32, NeighborInfo>) -> HashMap<(u32, u32), (f64, u64)> {
    let mut snr_hashmap = HashMap::<(u32, u32), (f64, u64)>::new();
    for (_, neighbor_packet) in &neighbors {
        let node_1 = neighbor_packet.node_id;
        for neighbor in &neighbor_packet.neighbors {
            let node_2 = neighbor.node_id;
            snr_hashmap.insert(
                as_key(node_1, node_2),
                (neighbor.snr as f64, neighbor.rx_time as u64),
            );
            let opposite_neighbor = get_corresponding_neighbor(node_2, node_1, &neighbors);
            if opposite_neighbor.is_some() {
                let opposite_neighbor = opposite_neighbor.unwrap();
                if neighbor.rx_time > opposite_neighbor.rx_time {
                    snr_hashmap.insert(
                        as_key(node_1, node_2),
                        (neighbor.snr as f64, neighbor.rx_time as u64),
                    );
                } else {
                    snr_hashmap.insert(
                        as_key(node_1, node_2),
                        (opposite_neighbor.snr as f64, opposite_neighbor.rx_time as u64),
                    );
                }
            } else {
                println!("Opposite neighbor not found for node {} and neighbor {}", node_1, node_2);
            }
        }
    }
    snr_hashmap
}
    // for node_packet in packets {
    //     let node_id = node_packet.id;
    //     for neighbor_packet in node_packet.neighbors {
    //         let neighbor_id = neighbor_packet.id;
    //         // Check if the edge is already in the hashmap
    //         let edge_exists = snr_hashmap.contains_key(&as_key(node_id, neighbor_id));
    //         if edge_exists {
    //             let edge_snr_time = snr_hashmap.get(&as_key(node_id, neighbor_id)).unwrap();
    //             let hashmap_timestamp = edge_snr_time.1;
    //             // Replace the edge if the new timestamp is more recent (larger)
    //             if hashmap_timestamp < neighbor_packet.timestamp {
    //                 snr_hashmap.insert(
    //                     as_key(node_id, neighbor_id),
    //                     (neighbor_packet.snr, neighbor_packet.timestamp),
    //                 );
    //             }
    //         } else {
    //             snr_hashmap.insert(
    //                 as_key(node_id, neighbor_id),
    //                 (neighbor_packet.snr, neighbor_packet.timestamp),
    //             );
    //         }
    //     }
    // }

pub fn get_corresponding_neighbor(
    node_id: u32,
    neighbor_id: u32,
    neighbors: &HashMap<u32, NeighborInfo>,
) -> Option<Neighbor> {
    let node = neighbors.get(&node_id).unwrap();
    for neighbor in &node.neighbors {
        if neighbor.node_id == neighbor_id {
            return Some(neighbor.clone());
        }
    }
    None
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
        };
        let neighbor_info_2: NeighborInfo = NeighborInfo {
            node_id: 2,
            tx_time: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_3.clone(), neighbor_4.clone()],
        };
        let neighbor_info_3: NeighborInfo = NeighborInfo {
            node_id: 3,
            tx_time: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_2.clone(), neighbor_4.clone()],
        };
        let neighbor_info_4: NeighborInfo = NeighborInfo {
            node_id: 4,
            tx_time: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_2.clone(), neighbor_3.clone()],
        };
        let neighborinfo_vec = vec![
            neighbor_info_1.clone(),
            neighbor_info_2.clone(),
            neighbor_info_3.clone(),
            neighbor_info_4.clone(),
        ];
        let mut neighborinfo_hashmap = HashMap::new();
        for neighborinfo in neighborinfo_vec {
            neighborinfo_hashmap.insert(neighborinfo.node_id, neighborinfo);
        }
        println!("neighborinfo_hashmap: {:?}", neighborinfo_hashmap);
        let snr_hashmap = init_edge_map(neighborinfo_hashmap);
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
            neighbors: vec![neighbor_2.clone()],
        };
        let neighbor_info_2: NeighborInfo = NeighborInfo {
            node_id: 2,
            tx_time: 0,
            neighbors: vec![neighbor_1.clone()],
        };
        let mut neighborinfo_hashmap = HashMap::new();
        let neighborinfo_vec = vec![neighbor_info_1, neighbor_info_2];
        for neighborinfo in neighborinfo_vec {
            neighborinfo_hashmap.insert(neighborinfo.node_id, neighborinfo);
        }
        let snr_hashmap = init_edge_map(neighborinfo_hashmap);
        println!("snr_hashmap: {:?}", snr_hashmap);
        assert_eq!(snr_hashmap.len(), 1);
        assert_eq!(snr_hashmap.get(&as_key(1, 2)).unwrap().0, 2.0);
    }
}
