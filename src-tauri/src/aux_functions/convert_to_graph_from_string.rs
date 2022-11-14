use crate::graph::{edge::Edge, graph_ds::Graph, node::Node};

pub fn convert_to_graph(mut graph_string: Vec<&str>) -> Graph {
    let mut graph = Graph::new();

    let mut nodes: Vec<String> = Vec::new();
    let mut edges: Vec<String> = Vec::new();

    for line in graph_string {
        if line.starts_with("O:") {
            let node = line.split(" ").collect::<Vec<&str>>()[1];
            nodes.push(node.to_string());
        } else if line.starts_with("E:") {
            let edge = line.split(" ").collect::<Vec<&str>>()[1..].join(" ");
            edges.push(edge);
        }
    }

    // add nodes
    for node in nodes {
        let mut node_struct = Node::new(node);
        graph.add_node_from_struct(node_struct);
    }

    // add edges
    for edge in edges {
        let edge_split = edge.split(" ").collect::<Vec<&str>>();
        let node1 = edge_split[0];
        let node2 = edge_split[1];
        let weight = edge_split[2].parse::<f64>().unwrap();

        let node1_idx = graph.get_node_idx(node1.to_string());
        let node2_idx = graph.get_node_idx(node2.to_string());

        let edge_struct = Edge::new(node1_idx, node2_idx, weight);
        graph.add_edge_from_struct(edge_struct);
    }

    // return graph;
    return graph;
}
