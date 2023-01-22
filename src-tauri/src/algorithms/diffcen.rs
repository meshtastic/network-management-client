use std::collections::HashMap;

use crate::aux_functions::adj_matrix::convert_to_adj_matrix;
use crate::graph::graph_ds::Graph;
use nalgebra::DMatrix;

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
pub fn diffusion_centrality(g: &Graph, T: u32) -> Option<HashMap<String, HashMap<String, f64>>> {
    let (adj_matrix, int_to_node_id) = convert_to_adj_matrix(g);
    let mut node_to_diffcen = HashMap::new();

    let flattened_matrix = adj_matrix
        .iter()
        .map(|row| row.iter())
        .flatten()
        .map(|x| *x)
        .collect::<Vec<f64>>();

    let matrix =
        DMatrix::from_row_slice(g.get_nodes().len(), g.get_nodes().len(), &flattened_matrix);

    let schur = matrix.clone().schur();

    let eigenvalues_option = schur.eigenvalues();

    match eigenvalues_option {
        // If eigenvalues are real, then we can unwrap the eigenvalues
        Some(eigenvalues) => {
            let eigenvalues_vec: Vec<f64> = eigenvalues.data.as_vec().clone();

            let largest_eigenvalue = eigenvalues_vec
                .iter()
                .max_by(|a, b| a.partial_cmp(b).unwrap())
                .unwrap_or(&1.0);

            let q = 1.0 / largest_eigenvalue;

            let identity_matrix =
                DMatrix::<f64>::identity(g.get_nodes().len(), g.get_nodes().len());

            let mut H = DMatrix::zeros(g.get_nodes().len(), g.get_nodes().len());

            for t in 1..T + 1 {
                H += (q * &matrix).pow(t) * &identity_matrix;
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
                    node_to_diffcen_inner
                        .insert(int_to_node_id.get(&j).unwrap().clone(), *col as f64);
                }
                node_to_diffcen.insert(
                    int_to_node_id.get(&i).unwrap().clone(),
                    node_to_diffcen_inner,
                );
            }

            Some(node_to_diffcen)
        }
        // Eigenvalues are complex, can't calculate diffusion centralities
        None => None,
    }
}

// add unit tests
#[cfg(test)]
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
}
