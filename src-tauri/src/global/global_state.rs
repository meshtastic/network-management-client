#![allow(dead_code)]

use std::collections::HashMap;
use std::time::SystemTime;

use nalgebra::DMatrix;

use crate::aux_data_structures::timeline::Timeline;
use crate::global::history::History;

use crate::global::algos_config::AlgoConfig;
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
pub struct GlobalState {
    timeline: Timeline,
    history: History,
    time: SystemTime,
    algo_configs: AlgoConfig,
    algo_run_mode_auto: bool,
    algo_store: AlgoStore,
    algo_controller: AlgoController,
}

impl GlobalState {
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
    pub fn new(config_fields: HashMap<&str, &str>, is_save: bool) -> GlobalState {
        GlobalState {
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
    pub fn add_graph(&mut self, graph: Graph) {
        self.timeline.add_snapshot(&graph);
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
}
