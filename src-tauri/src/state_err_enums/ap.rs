use petgraph::graph::NodeIndex;

#[derive(Debug)]
pub enum APResult {
    Success(Vec<NodeIndex>),
    Error(String),
    Empty(bool),
}

impl Clone for APResult {
    fn clone(&self) -> Self {
        match self {
            APResult::Success(aps) => APResult::Success(aps.clone()),
            APResult::Error(err) => APResult::Error(err.clone()),
            APResult::Empty(empty) => APResult::Empty(*empty),
        }
    }
}
