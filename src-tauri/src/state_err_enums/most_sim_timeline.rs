use crate::graph::graph_ds::Graph;

#[derive(Debug)]
pub enum MostSimTResult {
    Success(Graph),
    Error(String),
}

impl Clone for MostSimTResult {
    fn clone(&self) -> Self {
        match self {
            MostSimTResult::Success(most_sim_g) => MostSimTResult::Success(most_sim_g.clone()),
            MostSimTResult::Error(err) => MostSimTResult::Error(err.clone()),
        }
    }
}
