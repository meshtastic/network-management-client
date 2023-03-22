use crate::graph::graph_ds::Graph;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum MostSimTResult {
    Success(Graph),
    Error(String),
    Empty(bool),
}
