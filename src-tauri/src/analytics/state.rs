#![allow(dead_code)]

use std::collections::HashMap;
use std::time::SystemTime;

use super::aux_data_structures::timeline::Timeline;
use crate::analytics::history::History;

use super::algos_config::AlgoConfig;
use crate::graph::graph_ds::Graph;

use super::algo_controller::AlgoController;
use super::algo_store::AlgoStore;

/// The GlobalState struct contains all the data that is not specific to a particular algorithm.
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
/// * `algos_to_run` - A Vec of Strings representing the algorithms to run.
/// * `algos_run_mode_auto` - A boolean indicating whether the algorithms should be run automatically or not.
pub struct State {
    timeline: Timeline,
    history: History,
    time: SystemTime,
    algo_configs: AlgoConfig,
    algo_run_mode_auto: bool,
    algo_store: AlgoStore,
    algo_controller: AlgoController,
}

impl State {
    /// Creates a new GlobalState object.
    ///
    /// # Arguments
    ///
    /// * `config_fields` - A HashMap containing the configuration fields.
    /// * `is_save` - A boolean indicating whether the timeline should be saved or not.
    ///
    /// # Returns
    ///
    /// * `GlobalState` - A new GlobalState object.
    pub fn new(config_fields: HashMap<&str, &str>, is_save: bool) -> State {
        State {
            timeline: Timeline::new(config_fields, is_save),
            history: History::new(),
            time: SystemTime::now(),
            algo_configs: AlgoConfig::new(),
            algo_run_mode_auto: true,
            algo_store: AlgoStore::new(),
            algo_controller: AlgoController::new(),
        }
    }

    /// Adds a graph to the timeline.
    ///
    /// # Arguments
    ///
    /// * `graph` - A Graph object.
    pub fn add_graph(&mut self, graph: &Graph) {
        self.timeline.add_snapshot(graph);
    }

    /// Sets which algorithms should be run.
    ///
    /// # Arguments
    ///
    /// * `algos_bitfield` - A u8 representing the algorithms to run.
    pub fn set_algos(&mut self, algos_bitfield: u8) {
        self.algo_configs.set_algos(algos_bitfield);
    }

    pub fn run_algos(&mut self) {
        let curr_graph_opt = self.timeline.get_curr_snapshot();
        match curr_graph_opt {
            Some(curr_graph) => {
                self.algo_controller.run_algos(
                    &curr_graph,
                    &self.algo_configs,
                    &mut self.history,
                    &mut self.algo_store,
                );
            }
            None => {
                println!("No graph to run algorithms on.");
            }
        }
    }

    /// Returns the algorithm result store. Frontend may use this to get the results of the algorithms.
    ///
    /// # Returns
    ///
    /// * `AlgoStore` - The algorithm result store.
    pub fn get_algo_results(&self) -> &AlgoStore {
        &self.algo_store
    }
}

/// Unit test
#[cfg(test)]
mod tests {
    use crate::analytics::algo_result_enums::ap::APResult;

    use super::*;

    #[test]
    fn test_state() {
        let mut state = State::new(HashMap::new(), false);

        let mut G1 = Graph::new();

        // Create a few nodes and edges and add to graph
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();

        let _u_idx = G1.add_node(u.clone());
        let _v_idx = G1.add_node(v.clone());
        let _w_idx = G1.add_node(w.clone());

        G1.add_edge(u.clone(), v.clone(), 1 as f64);
        G1.add_edge(u.clone(), w.clone(), 7 as f64);
        G1.add_edge(v.clone(), w.clone(), 35 as f64);

        state.add_graph(&G1);
        state.set_algos(0b00001);
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
}
