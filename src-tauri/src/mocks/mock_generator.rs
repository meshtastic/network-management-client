use crate::aux_data_structures::neighbor_info::{Neighbor, NeighborInfo};
use crate::aux_functions::conversion_factors::{HANOVER_LAT_PREFIX, HANOVER_LON_PREFIX};
use rand::prelude::*;
use rand::seq::SliceRandom;
/*
Generate a randomly connected graph with the degree of connectedness specified by percent_connected.

Note: this graph does not currently have location info attached. Location info will be retrieved
by mapping the node id to its location info.
*/
pub fn generate_loc_independent_packets(
    num_nodes: i32,
    percent_connected: f64,
) -> Vec<NeighborInfo> {
    let mut neighborinfo_vec = Vec::new();
    for node_id in 0..num_nodes {
        let mut new_neighbor = NeighborInfo {
            // Assign sequential ids
            id: node_id as u32,
            // Assign zero time for now
            timestamp: 0,
            // Initialize empty neighbor lists
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
        let mut rng = rand::thread_rng();
        let rand_nbr_snr: f64 = rng.gen(); // generates a float between 0 and 1
                                           // Push a copy of the second neighbor into the first neighbor's neighbor list
        let edge_neighbor = Neighbor {
            id: neighborinfo_vec[second_neighbor_id as usize].id,
            snr: rand_nbr_snr,
            timestamp: 0,
        };
        neighborinfo_vec[first_neighbor_id as usize]
            .neighbors
            .push(edge_neighbor);
    }
    neighborinfo_vec
}

/* Create a vector of location info that can be mapped to by sequential node ids */
pub fn generate_loc_info(num_nodes: i32) -> Vec<(f64, f64, f64)> {
    let mut node_locations = Vec::new();
    for _ in 0..num_nodes {
        let rand_lat: f64 = HANOVER_LAT_PREFIX + rand::random::<f64>() * 0.01;
        let rand_long: f64 = HANOVER_LON_PREFIX + rand::random::<f64>() * 0.01;
        let rand_alt: f64 = rand::random::<f64>() * 100.0;
        node_locations.push((rand_lat, rand_long, rand_alt));
    }
    node_locations
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_three_nodes() {
        let neighborinfo = generate_loc_independent_packets(3, 0.8);
        // run unittests with -- --nocapture to print the structs
        println!("{:?}", neighborinfo);
        assert_eq!(neighborinfo.len(), 3);
    }
}
