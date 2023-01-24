use nalgebra::DMatrix;
use std::collections::HashMap;

use crate::global::algos_config::Params;

/// Calculates the diffusion centrality of each node in the graph.
/// Diffusion centrality is a measure of how much information a node
/// can diffuse to other nodes in the graph.
///
/// # Arguments
///
/// * `g` - The graph to calculate diffusion centrality for.
///
/// # Returns
///
/// * `Option<HashMap<String, HashMap<String, f64>>>` - A hashmap of node ids to a hashmap of node ids to diffusion centrality values.
pub fn diffusion_centrality(
    adj_matrix: &DMatrix<f64>,
    int_to_node_id: HashMap<usize, String>,
    params: &Params,
    eigenvals: Vec<f64>,
    n: usize,
) -> HashMap<String, HashMap<String, f64>> {
    let T = params.get("T").unwrap_or(&(5 as u32));

    let mut node_to_diffcen = HashMap::new();

    let largest_eigenvalue = eigenvals
        .iter()
        .max_by(|a, b| a.partial_cmp(b).unwrap())
        .unwrap_or(&1.0);

    let q = 1.0 / largest_eigenvalue;

    let identity_matrix = DMatrix::<f64>::identity(n, n);

    let mut H = DMatrix::zeros(n, n);

    for t in 1..T + 1 {
        H += (q * adj_matrix).pow(t) * &identity_matrix;
    }

    for (i, row) in H.row_iter().enumerate() {
        let row_sum = row.sum();

        // divide the row by the sum of the row
        let row_normalized = row.map(|x| x / row_sum);

        let mut node_to_diffcen_inner = HashMap::new();
        for (j, col) in row_normalized.iter().enumerate() {
            if i == j {
                let sum = row.sum();
                node_to_diffcen_inner.insert(int_to_node_id.get(&j).unwrap().clone(), sum);
                continue;
            }
            node_to_diffcen_inner.insert(int_to_node_id.get(&j).unwrap().clone(), *col as f64);
        }
        node_to_diffcen.insert(
            int_to_node_id.get(&i).unwrap().clone(),
            node_to_diffcen_inner,
        );
    }

    node_to_diffcen
}

// add unit tests
/* #[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diffusion_centrality() {
        let mut G1 = Graph::new();

        // Create a few nodes and edges and add to graph
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();

        let _u_idx = G1.add_node(u.clone());
        let _v_idx = G1.add_node(v.clone());
        let _w_idx = G1.add_node(w.clone());

        G1.add_edge(u.clone(), v.clone(), 1 as f64);
        G1.add_edge(u.clone(), w.clone(), 7 as f64);
        G1.add_edge(v.clone(), w.clone(), 35 as f64);

        let diff_cents = diffusion_centrality(&G1, 1);
        println!("{:?}", diff_cents);
        assert!(diff_cents.is_some());
    }
} */
