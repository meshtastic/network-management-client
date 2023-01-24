use crate::graph::graph_ds::Graph;

#[derive(Debug)]
pub enum PredStateResult {
    Success(Graph),
    Error(String),
}

impl Clone for PredStateResult {
    fn clone(&self) -> Self {
        match self {
            PredStateResult::Success(most_sim_g) => PredStateResult::Success(most_sim_g.clone()),
            PredStateResult::Error(err) => PredStateResult::Error(err.clone()),
        }
    }
}
