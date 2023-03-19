use serde::{Deserialize, Serialize};
use crate::graph::edge::Edge;

#[derive(Debug, Serialize, Deserialize)]
pub enum MinCutResult {
    Success(Vec<Edge>),
    Error(String),
    Empty(bool),
}

impl Clone for MinCutResult {
    fn clone(&self) -> Self {
        match self {
            MinCutResult::Success(mincut_edges) => MinCutResult::Success(mincut_edges.clone()),
            MinCutResult::Error(err) => MinCutResult::Error(err.clone()),
            MinCutResult::Empty(empty) => MinCutResult::Empty(*empty),
        }
    }
}
