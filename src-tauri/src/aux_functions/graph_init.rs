use super::datatypes::{Neighbor, NeighborInfo};
use super::edge_factory::edge_factory;
use crate::algorithms::articulation_point::articulation_point;
use crate::graph::edge::Edge;
use crate::graph::graph_ds::Graph;
use crate::graph::node::Node;
use app::protobufs::{Position, User};
use petgraph::graph::NodeIndex;

#[tauri::command]
pub fn run_algorithm(data: Vec<NeighborInfo>, algorithm: u32) {
    //TODO:
}

/*
* Do postprocessing of the algorithm result and return it in the format the frontend expects.
*/
pub fn convert_data_for_display(graph: Graph) {
    //TODO:
}

/*
* This function creates a graph from the input data.
*/
pub fn load_graph(data: Vec<NeighborInfo>) -> Graph {
    let mut graph = Graph::new();
    // Our edges will contain repeated nodes, so we need to keep of them separately
    let mut edge_left_endpoints = Vec::<NodeIndex>::new();
    let mut edge_right_endpoints = Vec::<NodeIndex>::new();
    let mut edge_distances = Vec::<f64>::new();
    let mut edge_radio_quality = Vec::<f64>::new();
    // for each info packet, create a node if necessary and add edge and distance info to the graph
    for mut graph_node in data {
        // Create a node if it doesn't exist
        let node_user = graph_node.user;
        let node_id = &node_user.id.clone();
        let node_x = graph_node.position.latitude_i;
        let node_y = graph_node.position.longitude_i;
        graph = init_graph_node_if_nec(graph, node_user);
        // Add edge and distance info to the graph for each neighbor
        for _ in 0..graph_node.num_neighbors {
            let neighbor = graph_node.neighbors.pop().unwrap();
            let neighbor_user = neighbor.user;
            let neighbor_id = &neighbor_user.id.clone();
            let neighbor_x = neighbor.position.latitude_i;
            let neighbor_y = neighbor.position.longitude_i;
            // Create a node if it doesn't exist
            graph = init_graph_node_if_nec(graph, neighbor_user);
            // Add edge and distance info to the graph
            let distance = calculate_distance(node_x, node_y, neighbor_x, neighbor_y);
            //TODO: radio quality calculation
            let radio_quality = calculate_radio_quality();
            // Store all the data for edge creation
            edge_left_endpoints.push(graph.get_node_idx(node_id.clone()));
            edge_right_endpoints.push(graph.get_node_idx(neighbor_id.clone()));
            edge_distances.push(distance);
            edge_radio_quality.push(radio_quality);
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
    //TODO:
    graph
}

pub fn init_graph_node_if_nec(mut graph: Graph, user: User) -> Graph {
    let node_id = &user.id;
    if !graph
        .node_idx_map
        .contains_key(&(node_id.clone() as String))
    {
        graph.add_node(node_id.clone() as String);
    }
    graph
}

/*
* Calculates the distance between two points on a sphere
*/
pub fn calculate_distance(node_x: i32, node_y: i32, nbr_x: i32, nbr_y: i32) -> f64 {
    //TODO:
    return 0.0;
}

pub fn calculate_radio_quality() -> f64 {
    //TODO:
    return 1.0;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protobuf_initialization() {
        let mut coord_name = "coordinator";
        let mut nbr_name = "responder";

        let coord_user = User {
            id: coord_name.to_string(),
            long_name: "Coordinator Node".to_string(),
            short_name: "CN".to_string(),
            macaddr: vec![1],
            hw_model: 0,
            is_licensed: false,
        };

        let coord_position = Position {
            latitude_i: 1,
            longitude_i: 2,
            altitude: 0,
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
            gps_accuracy: 1,
            ground_speed: 0,
            ground_track: 0,
            fix_quality: 0,
            fix_type: 0,
            sats_in_view: 0,
            sensor_id: 0,
            next_update: 5,
            seq_number: 0,
        };

        let nbr_user = User {
            id: nbr_name.to_string(),
            long_name: "Responder Node".to_string(),
            short_name: "RN".to_string(),
            macaddr: vec![0],
            hw_model: 0,
            is_licensed: false,
        };

        let nbr_position = Position {
            latitude_i: 5,
            longitude_i: 6,
            altitude: 0,
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
            gps_accuracy: 1,
            ground_speed: 0,
            ground_track: 0,
            fix_quality: 0,
            fix_type: 0,
            sats_in_view: 0,
            sensor_id: 0,
            next_update: 5,
            seq_number: 0,
        };

        let nbr_vec = Neighbor {
            user: nbr_user,
            position: nbr_position,
        };

        let neighbor_info = NeighborInfo {
            user: coord_user,
            position: coord_position,
            num_neighbors: 1,
            neighbors: vec![nbr_vec],
        };

        let graph = load_graph(vec![neighbor_info]);
        let expected_dist = 4_f64 * 2_f64.sqrt();
        // We should have one edge with corresp weight
        println!("Node idx: {:?}", graph.node_idx_map);
        println!("Edge idx: {:?}", graph.edge_idx_map);
        let u_idx = graph
            .node_idx_map
            .get(&coord_name.clone() as &str)
            .unwrap()
            .clone();
        let v_idx = graph
            .node_idx_map
            .get(&nbr_name.clone() as &str)
            .unwrap()
            .clone();
        println!(
            "and the edge is: {:?}",
            graph.edge_idx_map.get(&(u_idx.clone(), v_idx.clone()))
        );
        let edge_idx = graph
            .edge_idx_map
            .get(&(u_idx.clone(), v_idx.clone()))
            .unwrap();
        let actual_dist = graph.g.edge_weight(edge_idx.clone()[0]).unwrap().weight;
        assert_eq!(actual_dist, expected_dist);

        // assert_eq!(graph.get_size(), 2);
    }
}
