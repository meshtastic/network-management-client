use crate::graph::graph_ds::Graph;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum PredStateResult {
    Success(Graph),
    Error(String),
    Empty(bool),
}
