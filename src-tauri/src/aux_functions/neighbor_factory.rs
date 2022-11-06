use super::edge_factory::edge_factory;
use crate::algorithms::articulation_point::articulation_point;
use crate::graph::edge::Edge;
use crate::graph::graph_ds::Graph;
use crate::graph::node::Node;
use app::protobufs::{Data, NeighborInfo};
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
            let neighbor_id = neighbor_info.neighbor_ids.pop().unwrap().id;
            let neighbor_x = neighbor_info.neighbor_positions.pop().unwrap().latitude_i;
            let neighbor_y = neighbor_info.neighbor_positions.pop().unwrap().longitude_i;
            // TODO: risky unwrap, needs error checking
            let x_distance_between = node_x - neighbor_x;
            let y_distance_between = node_y - neighbor_y;
            let distance_between =
                ((x_distance_between.pow(2) + y_distance_between.pow(2)) as f64).sqrt();
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

// printing utility for testing
fn print_protobuf(data: Data) -> Result<Data, String> {
    // let mut data = serde_protobuf::from_bytes::<Data>(&data).unwrap();
    println!("data: {:?}", data);
    return Ok(data);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protobuf_initialization() {
        println!("here goes nothing");
        let mut data = vec![1u8, 2, 3];
        //let portnum = PortNum::UNKNOWN_APP;
        let mut payload = Data {
            portnum: 0, //portnum,
            payload: data,
            want_response: false,
            dest: 0,
            source: 1,
            request_id: 0,
            reply_id: 1,
            emoji: 0,
        };
        print_protobuf(payload);
    }

    #[test]
    fn test_edge_factory() {
        let u = NodeIndex::new(0);
        let v = NodeIndex::new(1);
        let w = NodeIndex::new(2);
        let x = NodeIndex::new(3);

        let a = vec![u.clone(), u.clone(), w.clone(), v.clone()];
        let b = vec![v.clone(), w.clone(), x.clone(), x.clone()];

        let distance = vec![0.45, 0.67, 0.23, 1.2];
        let radio_s_quality = vec![5.5, 3.12, 10.3, 2.7];

        let edges = edge_factory(a, b, distance, radio_s_quality, None, None);

        for edge in edges {
            assert!(edge.weight >= 0.0 && edge.weight <= 1.1);
        }
    }
}
