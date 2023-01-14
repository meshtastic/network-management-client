use super::edge_factory::edge_factory;
use super::take_snapshot::total_distance;
use crate::aux_data_structures::neighbor_info::{Neighbor, NeighborInfo};
use crate::aux_functions::conversion_factors::*;
use crate::graph::graph_ds::Graph;
use petgraph::graph::NodeIndex;

/*
* This function creates a graph from the input data.
*/
pub fn load_graph(data: Vec<NeighborInfo>) -> Graph {
    // Our edges will contain repeated nodes, so we need to keep of them separately
    let mut graph = Graph::new();
    let mut edge_left_endpoints = Vec::<NodeIndex>::new();
    let mut edge_right_endpoints = Vec::<NodeIndex>::new();
    let mut edge_distances = Vec::<f64>::new();
    let mut edge_radio_quality = Vec::<f64>::new();

    for nbr_info in data {
        let name: String = nbr_info.id.to_string();
        if !graph.contains_node(name.clone()) {
            graph.add_node(name.clone());
        }
        let node_idx = graph.get_node_idx(name.clone());
        for neighbor in nbr_info.neighbors {
            //initialize node if it doesn't exist
            let neighbor_name = neighbor.id.to_string();
            if !graph.contains_node(neighbor_name.clone()) {
                graph.add_node(neighbor_name.clone());
            }
            let nbr_idx = graph.get_node_idx(neighbor_name.clone());
            let distance = calculate_converted_distance(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

            edge_left_endpoints.push(node_idx);
            edge_right_endpoints.push(nbr_idx);
            edge_radio_quality.push(neighbor.snr as f64);
            edge_distances.push(distance);
        }
    }
    // Create the edges
    let edges = edge_factory(
        edge_left_endpoints,
        edge_right_endpoints,
        edge_distances,
        edge_radio_quality,
        None,
        None,
    );
    // Add the edges to the graph
    for edge in edges {
        graph.add_edge_from_struct(edge);
    }
    graph
}

/*
* Calculates the distance between two points on a sphere
*
* Conversion function:
* Lat/Long: 1e-7 conversion from int to floating point degrees; see mesh.proto
* Altitude: in meters above sea level, no conversion needed
*/
fn calculate_converted_distance(x: f64, y: f64, z: f64, nbr_x: f64, nbr_y: f64, nbr_z: f64) -> f64 {
    let conversion_factor = (10.0 as f64).powi(-7);
    return total_distance(
        x * LAT_CONVERSION_FACTOR,
        y * LON_CONVERSION_FACTOR,
        z * ALT_CONVERSION_FACTOR,
        nbr_x * LAT_CONVERSION_FACTOR,
        nbr_y * LON_CONVERSION_FACTOR,
        nbr_z * ALT_CONVERSION_FACTOR,
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_graph() {
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
        let graph = load_graph(vec![
            neighbor_info_1,
            neighbor_info_2,
            neighbor_info_3,
            neighbor_info_4,
        ]);
        // Check that the graph has the correct number of nodes
        assert_eq!(graph.get_order(), 4);
        // Check that the graph has the correct number of edges
        assert_eq!(graph.get_size(), 12);
    }
}
