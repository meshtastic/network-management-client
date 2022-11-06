use crate::graph::edge::Edge;
use crate::graph::graph_ds::Graph;
use crate::graph::node::Node;
use app::protobufs::{Data, NeighborInfo, Position, User};
use petgraph::graph::NodeIndex;
use 

// Take in data from the frontend in protobuf form, parse it, run algorithms on it, and
// send it back.

#[tauri::command]`
pub fn run_algorithm(data: Vec<NeighborInfo>, algorithm: String) -> Result<Vec<Point>, String> {
    // Create a graph
    let mut graph = populate_graph(data);
    
    // Run the specified algorithm on the graph (based on the input)
    let result = articulation_point(graph);

    // Return the result of the algorithm to the frontend in the specified data structure
    // We need to define the data fields of the response values (simply a point cloud?)
    Vec<Point> result = Vec<Point>::new();
    result = create_point_cloud_from_graph(graph);
    return result;
}


pub fn create_point_cloud_from_graph(graph: Graph) -> Vec<Point> {
    // Create a point cloud from the graph
    // Return the point cloud
    Vec<Point> point_cloud = Vec<Point>::new();
    for node in graph.get_nodes() {
        let node_position = node.position.unwrap();
        let node_position_x = node_position.x;
        let node_position_y = node_position.y;
        let node_position_z = node_position.z;
        let point = Point {
            x: node_position_x,
            y: node_position_y,
            z: node_position_z,
        };
        point_cloud.push(point);
    }
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
  let mut edge_left_endpoints = Vec<NodeIndex>::new();
  let mut edge_right_endpoints = Vec<NodeIndex>::new();
  let mut distances = Vec<f64>::new();
  let mut radio_quality = Vec<f64>::new();
  // for each node we have info on, add it and all its neighbors to the graph
  for neighbor_info in data {
    // Add node
    if !graph.contains_node(neighbor.name) {
      let node = Node::new(neighbor_info.user.name, neighbor_info.user.position);
      graph.add_node(node);
    }
    // Add neighbors
    for neighbor in neighbor_info.neighbors {
      if !graph.contains_node(neighbor.name) {
        let neighbor_node = Node::new(neighbor.name, neighbor.position);
        edge_left_endpoints.add(neighbor_node);
        edge_right_endpoints.add(neighbor_info);
        let edge = Edge::new(neighbor_node, neighbor.weight);
        graph.add_edge(edge);
      }
    }
  }
  return graph;
}

// printing utility for testing
fn print_protobuf(data: Data) -> Result<Data, String> {
    // let mut data = serde_protobuf::from_bytes::<Data>(&data).unwrap();
    println!("data: {:?}", data);
    return Ok(data);
}

fn print_graph(graph: Graph) -> Result<Graph, String> {
    println!("graph: {:?}", graph.to_string());
    return Ok(graph);
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
