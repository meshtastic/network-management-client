#![allow(dead_code)]

use std::collections::HashMap;
use std::time::SystemTime;

use crate::aux_data_structures::stoer_wagner_ds::StoerWagnerGraph;
use crate::aux_data_structures::timeline::Timeline;

use crate::global::history::History;

use crate::global::algos_config::AlgoConfig;

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
    adj_matrix: Vec<Vec<f64>>,
    int_to_node_id: HashMap<usize, String>,
    node_id_to_int: HashMap<String, usize>,
    history: History,
    time: SystemTime,
    algos_to_run: AlgoConfig,
    algos_run_mode_auto: bool,
    algo_store: AlgoStore,
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
    pub fn new(config_fields: HashMap<&str, &str>, is_save: bool) -> Self {
        GlobalState {
            timeline: Timeline::new(config_fields, is_save),
            adj_matrix: Vec::new(),
            int_to_node_id: HashMap::new(),
            node_id_to_int: HashMap::new(),
            history: History::new(),
            time: SystemTime::now(),
            algos_to_run: AlgoConfig::new(),
            algos_run_mode_auto: true,
            algo_store: AlgoStore::new(),
        }
    }

    /// Sets which algorithms should be run.
    ///
    /// # Arguments
    ///
    /// * `algos_bitfield` - A u8 representing the algorithms to run.
    pub fn set_algos(&mut self, algos_bitfield: u8) {
        self.algos_to_run.set_algos(algos_bitfield);
    }
}
