use crate::graph::graph_ds::Graph;
use std::collections::HashMap;

/// Converts a graph to an adjacency matrix.
///
/// # Arguments
///
/// * `graph` - a graph
///
/// # Returns
///
/// * `Vec<Vec<f64>>` - an adjacency matrix
pub fn convert_to_adj_matrix(graph: &Graph) -> (Vec<Vec<f64>>, HashMap<usize, String>) {
    let mut adj_matrix = Vec::new();

    let nodes = graph.get_nodes();
    let edges = graph.get_edges();

    let mut ordering_counter = 0 as usize;
    let mut node_id_to_int = HashMap::new();
    let mut int_to_node_id = HashMap::new();

    for node in &nodes {
        node_id_to_int.insert(node.name.clone(), ordering_counter);
        int_to_node_id.insert(ordering_counter, node.name.clone());
        ordering_counter += 1;
    }

    for _ in 0..nodes.len() {
        let mut row = Vec::new();
        for _ in 0..nodes.len() {
            row.push(0.0);
        }
        adj_matrix.push(row);
    }

    for edge in edges {
        let u_name = graph.get_node(edge.get_u()).name.clone();
        let v_name = graph.get_node(edge.get_v()).name.clone();

        let u_id = node_id_to_int.get(&u_name).unwrap();
        let v_id = node_id_to_int.get(&v_name).unwrap();

        let weight = edge.get_weight();

        adj_matrix[*u_id][*v_id] = weight;
        adj_matrix[*v_id][*u_id] = weight;
    }

    return (adj_matrix, int_to_node_id);
}

#[cfg(test)]
mod tests {
    use crate::graph::{edge::Edge, node::Node};

    use super::*;

    #[test]
    fn test_adj_matrix() {
        let mut G1 = Graph::new();

        // Create a few nodes and edges and add to graph
        let a = "a".to_string();
        let b = "b".to_string();
        let c = "c".to_string();
        let d = "d".to_string();

        let mut a_node = Node::new(a.clone());
        a_node.set_gps(-72.28486, 43.71489, 1.0);
        let a_idx = G1.add_node_from_struct(a_node);

        let mut b_node = Node::new(b.clone());
        b_node.set_gps(-72.28239, 43.71584, 1.0);
        let b_idx = G1.add_node_from_struct(b_node);

        let mut c_node = Node::new(c.clone());
        c_node.set_gps(-72.28332, 43.7114, 1.0);
        let c_idx = G1.add_node_from_struct(c_node);

        let mut d_node = Node::new(d.clone());
        d_node.set_gps(-72.28085, 43.71235, 1.0);
        let d_idx = G1.add_node_from_struct(d_node);

        let a_b = Edge::new(a_idx, b_idx, 0.51);
        G1.add_edge_from_struct(a_b);

        let a_c = Edge::new(a_idx, c_idx, 0.39);
        G1.add_edge_from_struct(a_c);

        let b_c = Edge::new(b_idx, c_idx, 0.4);
        G1.add_edge_from_struct(b_c);

        let b_d = Edge::new(b_idx, d_idx, 0.6);
        G1.add_edge_from_struct(b_d);

        let (adj_matrix, int_to_node_if) = convert_to_adj_matrix(&G1);

        // assert that the adjacency matrix is correct
        assert_eq!(
            adj_matrix,
            vec![
                vec![0.0, 0.51, 0.39, 0.0],
                vec![0.51, 0.0, 0.4, 0.6],
                vec![0.39, 0.4, 0.0, 0.0],
                vec![0.0, 0.6, 0.0, 0.0]
            ]
        );
    }
}
