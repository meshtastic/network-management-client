use serde::{Deserialize, Serialize};
use crate::graph::graph_ds::Graph;

#[derive(Debug, Serialize, Deserialize)]
pub enum PredStateResult {
    Success(Graph),
    Error(String),
    Empty(bool),
}

impl Clone for PredStateResult {
    fn clone(&self) -> Self {
        match self {
            PredStateResult::Success(most_sim_g) => PredStateResult::Success(most_sim_g.clone()),
            PredStateResult::Error(err) => PredStateResult::Error(err.clone()),
            PredStateResult::Empty(empty) => PredStateResult::Empty(*empty),
        }
    }
}
