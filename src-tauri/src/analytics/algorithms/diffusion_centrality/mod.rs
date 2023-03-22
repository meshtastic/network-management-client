use nalgebra::DMatrix;
use std::collections::HashMap;

pub mod results;

use results::DiffCenError;

use self::results::{DiffCenResult, EigenvalsResult};

use super::AlgorithmRunner;

pub struct DiffusionCentralityRunner {
    params: DiffusionCentralityParams,
}

pub struct DiffusionCentralityParams {
    pub t_param: u32,
}

impl AlgorithmRunner for DiffusionCentralityRunner {
    type Parameters = DiffusionCentralityParams;
    type Result = DiffCenResult;

    fn new(params: Self::Parameters) -> Self {
        DiffusionCentralityRunner { params }
    }

    /// Calculates the diffusion centrality of each node in the graph.
    /// Diffusion centrality is a measure of how much information a node
    /// can diffuse to other nodes in the graph.
    fn run(&mut self, graph: &crate::graph::graph_ds::Graph) -> Self::Result {
        let t_param = &self.params.t_param;

        let n = graph.get_order();
        let (_, int_to_node_id, adj_matrix) = graph.convert_to_adj_matrix();
        let adj_matrix = &adj_matrix;

        let eigenvals = match graph.eigenvals(adj_matrix) {
            EigenvalsResult::Success(eigenvals_vec) => eigenvals_vec,
            EigenvalsResult::Error(err) => {
                return DiffCenResult::Error(DiffCenError::EigenvalueError(err))
            }
            EigenvalsResult::Empty(b) => return DiffCenResult::Empty(b),
        };

        let mut node_to_diffcen = HashMap::new();

        let largest_eigenvalue = eigenvals
            .iter()
            .max_by(|a, b| a.total_cmp(b))
            .unwrap_or(&1.0);

        let q = 1.0 / largest_eigenvalue;

        let identity_matrix = DMatrix::<f64>::identity(n, n);

        let mut h_matrix = DMatrix::zeros(n, n);

        for t in 1..t_param + 1 {
            h_matrix += (q * adj_matrix).pow(t) * &identity_matrix;

            let mut node_to_diffcen_at_t = HashMap::new();

            for (i, row) in h_matrix.row_iter().enumerate() {
                let row_sum = row.sum();

                // divide the row by the sum of the row
                let row_normalized = row.map(|x| x / row_sum);

                let mut node_to_diffcen_inner = HashMap::new();
                for (j, col) in row_normalized.iter().enumerate() {
                    let node_id_j = match query_node_id(j, &int_to_node_id) {
                        Ok(id) => id,
                        Err(_err) => {
                            return DiffCenResult::Error(DiffCenError::NodeIdLookupError(
                                j.try_into().expect("Failure to convert usize into u32"),
                            ))
                        }
                    };

                    if i == j {
                        let sum = row.sum();
                        node_to_diffcen_inner.insert(node_id_j, sum);
                        continue;
                    }

                    node_to_diffcen_inner.insert(node_id_j, *col);
                }

                let node_id_i = match query_node_id(i, &int_to_node_id) {
                    Ok(id) => id,
                    Err(_err) => {
                        return DiffCenResult::Error(DiffCenError::NodeIdLookupError(
                            i.try_into().expect("Failure to convert usize into u32"),
                        ))
                    }
                };

                node_to_diffcen_at_t.insert(node_id_i, node_to_diffcen_inner);
            }

            node_to_diffcen.insert(t.to_string(), node_to_diffcen_at_t);
        }

        DiffCenResult::Success(node_to_diffcen)
    }
}

fn query_node_id(
    id: usize,
    int_to_node_id: &HashMap<usize, String>,
) -> Result<String, DiffCenError> {
    let id = int_to_node_id
        .get(&id)
        .ok_or(DiffCenError::NodeIdLookupError(id as u32))?;

    Ok(id.to_owned())
}
