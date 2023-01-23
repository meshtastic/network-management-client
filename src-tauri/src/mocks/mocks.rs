use crate::aux_data_structures::neighbor_info::{Neighbor, NeighborInfo};
use crate::aux_functions::conversion_factors::{
    ALT_CONVERSION_FACTOR, HANOVER_LAT_PREFIX, HANOVER_LON_PREFIX, LAT_CONVERSION_FACTOR,
    LON_CONVERSION_FACTOR,
};
use crate::mesh::device::MeshNode;
use app::protobufs;
use rand::prelude::*;
use rand::seq::SliceRandom;
use std::collections::HashMap;

// Generate a list of neighborinfo packets for a graph with given number of nodes and percent connectedness.
pub fn mock_neighborinfo_packets(num_nodes: i32, percent_connected: f64) -> Vec<NeighborInfo> {
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

pub fn mock_meshnode_packets(num_nodes: i32) -> Vec<MeshNode> {
    let mut meshnode_vec = Vec::new();
    for node_id in 0..num_nodes {
        let rand_lat: f64 =
            HANOVER_LAT_PREFIX + rand::random::<f64>() * 0.01 / LAT_CONVERSION_FACTOR;
        let rand_long: f64 =
            HANOVER_LON_PREFIX + rand::random::<f64>() * 0.01 / LON_CONVERSION_FACTOR;
        let rand_alt: f64 = rand::random::<f64>() * 100.0 / ALT_CONVERSION_FACTOR;
        let position = protobufs::Position {
            latitude_i: rand_lat as i32,
            longitude_i: rand_long as i32,
            altitude: rand_alt as i32,
            time: 0,
            location_source: 0,
            altitude_source: 0,
            timestamp: 0,
            timestamp_millis_adjust: 0,
            altitude_hae: 0,
            altitude_geoidal_separation: 0,
            pdop: 0,
            hdop: 0,
            vdop: 0,
            gps_accuracy: 0,
            ground_speed: 0,
            ground_track: 0,
            fix_quality: 0,
            fix_type: 0,
            sats_in_view: 0,
            sensor_id: 0,
            next_update: 0,
            seq_number: 0,
        };
        let user = protobufs::User {
            id: "test".to_string(),
            long_name: "test".to_string(),
            short_name: "test".to_string(),
            macaddr: Vec::new(),
            hw_model: 0,
            is_licensed: false,
        };
        let device_metrics = protobufs::DeviceMetrics {
            battery_level: 0,
            voltage: 0.0,
            channel_utilization: 0.0,
            air_util_tx: 0.0,
        };
        let node_info = protobufs::NodeInfo {
            num: node_id as u32,
            user: Some(user),
            position: Some(position),
            snr: 0.0,
            last_heard: 0,
            device_metrics: Some(device_metrics),
        };
        let meshnode = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: node_info,
        };
        meshnode_vec.push(meshnode);
    }
    meshnode_vec
}

pub fn mock_edge_map_from_loc_info(
    nodes: HashMap<u32, MeshNode>,
) -> HashMap<(u32, u32), (f64, u64)> {
    //TODO: Implement
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_three_nodes() {
        let neighborinfo = mock_neighborinfo_packets(3, 0.8);
        // run unittests with -- --nocapture to print the structs
        println!("{:?}", neighborinfo);
        assert_eq!(neighborinfo.len(), 3);
    }
}
