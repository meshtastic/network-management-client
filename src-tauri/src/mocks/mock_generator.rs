use crate::aux_data_structures::neighbor_info::NeighborInfo;
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

pub const HANOVER_LON_PREFIX: i32 = 43.70;
pub const HANOVER_LAT_PREFIX: i32 = 72.28;

/*
Generates mock protobufs of struct types below
*/
pub fn mock_generator(num_nodes: i32) -> Vec<NeighborInfo> {
    let mut neighborinfo_vec = Vec::new();
    for node_id in 0..num_nodes {
        neighborinfo_vec[node_id] = NeighborInfo {
            selfnode: Neighbor {
                // Assign sequential ids
                id: node_id,
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
    }
    // Connect graph randomly

    neighborinfo_vec
}

pub fn mock_datastream(num_nodes: i32) -> neighborinfo_protobuf::NeighborInfo {
    /*
    Call mock generator in a loop with the same number of nodes to simulate a datastream from a moving network
    */
}

#[cfg(test)]
mod tests {
    use super::*;

    /* Generate a random number of protobufs */
    fn test_init_three_nodes() {
        let neighborinfo = mock_generator(3);
        assert_eq!(neighborinfo.get_neighbors().len(), 3);
    }
}
