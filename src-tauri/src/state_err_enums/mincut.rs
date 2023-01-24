use crate::graph::edge::Edge;

#[derive(Debug)]
pub enum MinCutResult {
    Success(Vec<Edge>),
    Error(String),
}

impl Clone for MinCutResult {
    fn clone(&self) -> Self {
        match self {
            MinCutResult::Success(mincut_edges) => MinCutResult::Success(mincut_edges.clone()),
            MinCutResult::Error(err) => MinCutResult::Error(err.clone()),
        }
    }
}
