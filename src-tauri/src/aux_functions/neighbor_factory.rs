use crate::graph::edge::Edge;
use crate::graph::graph_ds::Graph;
use crate::graph::node::Node;
use app::protobufs::{Data, Position};
use petgraph::graph::NodeIndex;

// Take in data from the frontend in protobuf form, parse it, run algorithms on it, and
// send it back.

#[tauri::command]
pub fn run_algorithm(data: Data) -> Result<Data, String> {
    Ok(data)
}

/*
* When we create a graph, we need a list of all nodes and each of their neighbor lists.
* This means we need N protobufs, where N is the number of nodes.
* Each protobuf will contain node ID, list of neighbors, GPS coords, and measurement of radio signal quality.
*
* We will use it to calculate the pythagorean distance between nodes, and use this to create their edge weights.
 */
pub fn create_graph(data: Data) -> Graph {
    let mut graph = Graph::new();
    for node in data.nodes {
        graph.add_node(node.id);
    }
    for edge in data.edges {
        graph.add_edge(edge.source, edge.target, edge.weight);
    }
    return graph;
}

// pass in protobufs and do things with them; e.g. run different algorithms with different data
pub fn print_protobuf(data: Data) -> Result<Data, String> {
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
