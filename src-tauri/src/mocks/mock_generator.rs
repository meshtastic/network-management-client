use crate::aux_data_structures::neighbor_info::{Neighbor, NeighborInfo};
use rand::seq::SliceRandom;
/*
Append two GPS decimal points to beginning of randomly generated latitude and longitude to simulate a moving network
within the Hanover area.
GPS precision is as follows:
1 decimal point - 11.1 km
2 decimal points - 1.11 km
3 decimal points - 110 meters
4 decimal points - 11 meters
See https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude/8674#8674
*/

pub const HANOVER_LON_PREFIX: f64 = 43.70;
pub const HANOVER_LAT_PREFIX: f64 = 72.28;

pub fn mock_generator(num_nodes: i32, percent_connected: f64) -> Vec<NeighborInfo> {
    let mut neighborinfo_vec = Vec::new();
    for node_id in 0..num_nodes {
        let mut new_neighbor = NeighborInfo {
            selfnode: Neighbor {
                // Assign sequential ids
                id: node_id as u32,
                // Assign latitude within zone
                lat: HANOVER_LON_PREFIX + rand::random::<f64>() * 0.01,
                // Assign longitude within zone
                lon: HANOVER_LON_PREFIX + rand::random::<f64>() * 0.01,
                // Assign flat altitude
                alt: 0.0,
                // Assign random SNR (0-1 float)
                snr: rand::random::<f64>(),
            },
            neighbors: Vec::new(),
        };
        neighborinfo_vec.push(new_neighbor)
    }

    // Add all the edges to a vector, then shuffle it and pick the first x edges to add to the graph
    let mut all_edges_vec = Vec::new();
    for node_id in 0..num_nodes {
        for neighbor_id in 0..num_nodes {
            if node_id != neighbor_id {
                all_edges_vec.push((node_id, neighbor_id));
            }
        }
    }
    all_edges_vec.shuffle(&mut rand::thread_rng());
    let num_added_edges = (all_edges_vec.len() as f64 * percent_connected) as i32;
    for edge_num in 0..num_added_edges {
        let first_neighbor_id = all_edges_vec[edge_num as usize].0;
        let second_neighbor_id = all_edges_vec[edge_num as usize].1;
        // Push a copy of the second neighbor into the first neighbor's neighbor list
        let edge_neighbor = neighborinfo_vec[second_neighbor_id as usize]
            .selfnode
            .clone();
        neighborinfo_vec[first_neighbor_id as usize]
            .neighbors
            .push(edge_neighbor);
    }
    neighborinfo_vec
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_three_nodes() {
        let neighborinfo = mock_generator(3, 0.8);
        // run unittests with -- --nocapture to print the structs
        println!("{:?}", neighborinfo);
        assert_eq!(neighborinfo.len(), 3);
    }
}
