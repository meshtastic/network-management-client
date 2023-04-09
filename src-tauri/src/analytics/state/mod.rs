#![allow(dead_code)]

use std::collections::HashMap;
use std::time::SystemTime;

use log::warn;

use self::configuration::{AlgorithmConfigFlags, AlgorithmConfiguration};
use self::controller::AlgoController;
use self::history::AlgorithmRunHistory;
use self::store::ResultsStore;
use super::data_structures::timeline::NetworkTimeline;

use crate::graph::graph_ds::Graph;

pub mod configuration;
pub mod controller;
pub mod history;
pub mod store;

/// The AnalyticsState struct contains all the data that is not specific to a particular algorithm.
/// It is used to store the state of the application.
///
/// # Fields
///
/// * `timeline` - A Timeline object.
/// * `adj_matrix` - A Vec of Vecs of f64s representing the adjacency matrix.
/// * `int_to_node_id` - A HashMap from usize to String representing the mapping from integers to node IDs.
/// * `node_id_to_int` - A HashMap from String to usize representing the mapping from node IDs to integers.
/// * `history` - A History object.
/// * `time` - A SystemTime object.
/// * `auto_run_algos` - A boolean indicating whether the algorithms should be run automatically or not.
pub struct AnalyticsState {
    timeline: NetworkTimeline,
    history: AlgorithmRunHistory,
    time: SystemTime,
    algo_configs: AlgorithmConfiguration,
    auto_run_algos: bool,
    algo_store: ResultsStore,
    algo_controller: AlgoController,
}

impl AnalyticsState {
    /// Creates a new AnalyticsState object.
    ///
    /// # Arguments
    ///
    /// * `config_fields` - A HashMap containing the configuration fields.
    /// * `is_save` - A boolean indicating whether the timeline should be saved or not.
    ///
    /// # Returns
    ///
    /// * `AnalyticsState` - A new AnalyticsState object.
    pub fn new(config_fields: HashMap<&str, &str>, is_save: bool) -> AnalyticsState {
        AnalyticsState {
            timeline: NetworkTimeline::new(config_fields, is_save),
            history: AlgorithmRunHistory::new(),
            time: SystemTime::now(),
            algo_configs: AlgorithmConfiguration::new(),
            auto_run_algos: true,
            algo_store: ResultsStore::new(),
            algo_controller: AlgoController::new(),
        }
    }

    /// Adds a graph snapshot to the timeline.
    ///
    /// # Arguments
    ///
    /// * `graph` - A Graph object.
    pub fn add_graph_snapshot(&mut self, graph: &Graph) {
        self.timeline.add_snapshot(graph);
    }

    /// Sets which algorithms should be run.
    ///
    /// # Arguments
    ///
    /// * `algos_bitfield` - A u8 representing the algorithms to run.
    pub fn set_algorithm_flags(&mut self, flags: AlgorithmConfigFlags) {
        self.algo_configs.set_algorithm_flags(flags);
    }

    pub fn run_algos(&mut self) {
        let curr_graph_opt = self.timeline.get_curr_snapshot();
        match curr_graph_opt {
            Some(curr_graph) => {
                self.algo_controller.run_algos(
                    curr_graph,
                    &self.algo_configs,
                    &mut self.history,
                    &mut self.algo_store,
                );
            }
            None => {
                warn!("No graph to run algorithms on.");
            }
        }
    }

    /// Returns the algorithm result store. Frontend may use this to get the results of the algorithms.
    ///
    /// # Returns
    ///
    /// * `AlgoStore` - The algorithm result store.
    pub fn get_algo_results(&self) -> &ResultsStore {
        &self.algo_store
    }
}

/// Unit test
#[cfg(test)]
mod tests {
    use super::super::algorithms::{
        articulation_point::results::APResult, diffusion_centrality::results::DiffCenResult,
    };
    use super::*;

    #[test]
    fn test_state() {
        let mut state = AnalyticsState::new(HashMap::new(), false);

        let mut graph1 = Graph::new();

        // Create a few nodes and edges and add to graph
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();

        let _u_idx = graph1.add_node(u.clone());
        let _v_idx = graph1.add_node(v.clone());
        let _w_idx = graph1.add_node(w.clone());

        graph1.add_edge(u.clone(), v.clone(), 1_f64);
        graph1.add_edge(u, w.clone(), 7_f64);
        graph1.add_edge(v, w, 35_f64);

        state.add_graph_snapshot(&graph1);

        state.set_algorithm_flags(AlgorithmConfigFlags {
            articulation_point: Some(true),
            diffusion_centrality: None,
            global_mincut: None,
            most_similar_timeline: None,
            predicted_state: None,
        });

        state.run_algos();

        let algo_results = state.get_algo_results();
        let ap_algo_res = algo_results.get_aps();
        match ap_algo_res {
            APResult::Success(aps) => {
                println!("AP algorithm returned: {:?}", aps);
                assert_eq!(aps.len(), 0);
            }
            APResult::Error(err_str) => {
                panic!("Error running AP algorithm: {}", err_str);
            }
            APResult::Empty(b) => {
                panic!("AP algorithm returned empty result: {}", b);
            }
        }
    }

    #[test]
    fn test_diffusion_centrality() {
        let mut state = AnalyticsState::new(HashMap::new(), false);

        let mut graph1 = Graph::new();

        // Create a few nodes and edges and add to graph
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();

        let _u_idx = graph1.add_node(u.clone());
        let _v_idx = graph1.add_node(v.clone());
        let _w_idx = graph1.add_node(w.clone());

        graph1.add_edge(u.clone(), v.clone(), 1_f64);
        graph1.add_edge(u, w.clone(), 7_f64);
        graph1.add_edge(v, w, 35_f64);

        state.add_graph_snapshot(&graph1);

        state.set_algorithm_flags(AlgorithmConfigFlags {
            articulation_point: None,
            diffusion_centrality: Some(true),
            global_mincut: None,
            most_similar_timeline: None,
            predicted_state: None,
        });

        state.run_algos();

        let algo_results = state.get_algo_results();

        let diff_cents_res = algo_results.get_diff_cent();
        match diff_cents_res {
            DiffCenResult::Success(diff_cents) => {
                println!("Diffusion centrality algorithm returned: {:?}", diff_cents);
            }
            DiffCenResult::Error(err) => {
                panic!("Error running diffusion centrality algorithm: {:?}", err);
            }
            DiffCenResult::Empty(b) => {
                panic!(
                    "Diffusion centrality algorithm returned empty result: {}",
                    b
                );
            }
        }
    }
}
