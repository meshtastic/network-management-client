use crate::graph::graph_ds::Graph;

pub mod articulation_point;
pub mod diffusion_centrality;
pub mod karker_stein;
pub mod most_similar_timeline;
pub mod predicted_state;
pub mod stoer_wagner;

pub trait AlgorithmRunner {
    type Parameters;
    type Result;

    fn new(params: Self::Parameters) -> Self;
    fn run(&mut self, graph: &Graph) -> Self::Result;
}
