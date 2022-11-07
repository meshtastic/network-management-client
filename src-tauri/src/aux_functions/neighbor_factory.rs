use super::edge_factory::edge_factory;
use crate::algorithms::articulation_point::articulation_point;
use crate::graph::edge::Edge;
use crate::graph::graph_ds::Graph;
use crate::graph::node::Node;
use app::protobufs::{Data, NeighborInfo, Position, User};
use petgraph::graph::NodeIndex;

pub struct Point {
    x: i32,
    y: i32,
}

// Take in data from the frontend in protobuf form, parse it, run algorithms on it, and
// send it back.
#[tauri::command]
pub fn run_algorithm(data: Vec<NeighborInfo>, algorithm: String) -> Result<Vec<Point>, String> {
    // Create a graph
    let mut graph = populate_graph(data);

    // Run the specified algorithm on the graph (based on the input)
    let result = articulation_point(graph.clone());

    // Return the result of the algorithm to the frontend in the specified data structure
    // We need to define the data fields of the response values (simply a point cloud?)
    let result = create_point_cloud_from_graph(graph);

    return Ok(result);
}

/*
* Do postprocessing of the algorithm result and return it in the format the frontend expects.
* We'll also need position data for each node and an ID.
*/
pub fn create_point_cloud_from_graph(graph: Graph) -> Vec<Point> {
    let point_cloud = Vec::<Point>::new();
    // TODO:
    return point_cloud;
}

/*
* When we create a graph, we need a list of all nodes and each of their neighbor lists.
* This means we need N protobufs, where N is the number of nodes.
* Each protobuf will contain node ID, list of neighbors, GPS coords, and measurement of radio signal quality.
*
* We will use it to calculate the pythagorean distance between nodes, and use this to create their edge weights.
 */
pub fn populate_graph(data: Vec<NeighborInfo>) -> Graph {
    let mut graph = Graph::new();
    let mut edge_left_endpoints = Vec::<NodeIndex>::new();
    let mut edge_right_endpoints = Vec::<NodeIndex>::new();
    let mut distances = Vec::<f64>::new();
    let radio_quality = Vec::<f64>::new();
    // for each node we have info on, add it and all its neighbors to the graph
    for mut neighbor_info in data {
        println!("Node Info: {:?}\n\n", neighbor_info);
        // Do basic none checks
        if neighbor_info.user == None || neighbor_info.position == None {
            println!("Error: Node info or position is None\n");
            return graph;
        }
        // Get node info
        let node_id = &neighbor_info.user.as_ref().unwrap().id;
        let node_x = neighbor_info.position.as_ref().unwrap().latitude_i;
        let node_y = neighbor_info.position.as_ref().unwrap().longitude_i;
        if !graph
            .node_idx_map
            .contains_key(&(node_id.clone() as String))
        {
            graph.add_node(node_id.clone() as String);
        }

        for i in 0..neighbor_info.num_neighbors {
            println!("Neighbor Info: {:?}\n\n", neighbor_info);
            let neighbor_id = neighbor_info.neighbor_ids.pop().unwrap().id;
            let neighbor_pos = neighbor_info.neighbor_positions.pop().unwrap();
            let neighbor_x = neighbor_pos.latitude_i;
            let neighbor_y = neighbor_pos.longitude_i;
            // TODO: risky unwrap, needs error checking
            // Here, we calculate the distance between the two nodes. We may need to store
            // additional info and do second pythagorean if the weight is the distance
            // from the COORDINATOR node.
            let x_distance_between = node_x - neighbor_x;
            let y_distance_between = node_y - neighbor_y;
            let distance_between =
                ((x_distance_between.pow(2) + y_distance_between.pow(2)) as f64).sqrt();
            println!("Distance between nodes: {}\n", distance_between);
            if !graph.node_idx_map.contains_key(&neighbor_id) {
                graph.add_node(neighbor_id.clone());
            }
            edge_left_endpoints.push(graph.get_node_idx(node_id.clone()));
            edge_right_endpoints.push(graph.get_node_idx(neighbor_id.clone()));
            distances.push(distance_between);
            //TODO: radio quality
        }
    }

    let edges = edge_factory(
        edge_left_endpoints,
        edge_right_endpoints,
        distances,
        radio_quality,
        None,
        None,
    );
    for edge in edges {
        graph.g.add_edge(edge.u, edge.v, edge);
    }
    graph
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protobuf_initialization() {
        println!("here goes nothing"); //REMOVE

        let mut coord_user = User {
            id: "coordinator".to_string(),
            long_name: "Coordinator Node".to_string(),
            short_name: "CN".to_string(),
            macaddr: vec![1],
            hw_model: 0,
            is_licensed: false,
        };

        let mut coord_position = Position {
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

        let mut nbr_user = User {
            id: "responder".to_string(),
            long_name: "Responder Node".to_string(),
            short_name: "RN".to_string(),
            macaddr: vec![0],
            hw_model: 0,
            is_licensed: false,
        };

        let mut nbr_position = Position {
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

        let mut neighbor_info = NeighborInfo {
            user: Some(coord_user),
            position: Some(coord_position),
            num_neighbors: 1,
            neighbor_ids: vec![nbr_user],
            neighbor_positions: vec![nbr_position],
        };

        let graph = populate_graph(vec![neighbor_info]);
        // println!("Graph: {:?}", graph);
        let expected_dist = 4_f64 * 2_f64.sqrt();
        // assert_eq!(graph.get_edges(), expected_dist);
        // assert_eq!(graph.get_size(), 2);
    }
}
