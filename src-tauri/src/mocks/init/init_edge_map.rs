use crate::aux_data_structures::neighbor_info::{Neighbor, NeighborInfo};
use std::collections::HashMap;

pub fn init_edge_map(packets: Vec<NeighborInfo>) -> HashMap<(u32, u32), (f64, u64)> {
    let mut snr_hashmap = HashMap::<(u32, u32), (f64, u64)>::new();
    for node_packet in packets {
        let node_id = node_packet.id;
        for neighbor_packet in node_packet.neighbors {
            let neighbor_id = neighbor_packet.id;
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

    #[test]
    pub fn test_init_edge_map() {
        let neighbor_1 = Neighbor {
            id: 1,
            timestamp: 0,
            snr: 1.0,
        };
        let neighbor_2 = Neighbor {
            id: 2,
            timestamp: 0,
            snr: 2.0,
        };
        let neighbor_3 = Neighbor {
            id: 3,
            timestamp: 0,
            snr: 3.0,
        };
        let neighbor_4 = Neighbor {
            id: 4,
            timestamp: 0,
            snr: 4.0,
        };
        let neighbor_info_1 = NeighborInfo {
            id: 1,
            timestamp: 0,
            neighbors: vec![neighbor_2.clone(), neighbor_3.clone(), neighbor_4.clone()],
        };
        let neighbor_info_2: NeighborInfo = NeighborInfo {
            id: 2,
            timestamp: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_3.clone(), neighbor_4.clone()],
        };
        let neighbor_info_3: NeighborInfo = NeighborInfo {
            id: 3,
            timestamp: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_2.clone(), neighbor_4.clone()],
        };
        let neighbor_info_4: NeighborInfo = NeighborInfo {
            id: 4,
            timestamp: 0,
            neighbors: vec![neighbor_1.clone(), neighbor_2.clone(), neighbor_3.clone()],
        };
        let neighborinfo_vec = vec![
            neighbor_info_1.clone(),
            neighbor_info_2.clone(),
            neighbor_info_3.clone(),
            neighbor_info_4.clone(),
        ];
        let mut snr_hashmap = init_edge_map(neighborinfo_vec);
        assert_eq!(snr_hashmap.len(), 4);
    }
}
