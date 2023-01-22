#![allow(dead_code)]

use std::collections::HashMap;
use std::time::SystemTime;

use crate::aux_data_structures::timeline::Timeline;
use crate::meta::history::History;

use crate::algorithms::articulation_point::articulation_point;
use crate::algorithms::stoer_wagner::stoer_wagner;

use crate::meta::algos_config::AlgoConfig;

use super::algo_store::AlgoStore;

/// The MetaState struct contains all the data that is not specific to a particular algorithm.
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
pub struct MetaState {
    timeline: Timeline,
    adj_matrix: Vec<Vec<f64>>,
    int_to_node_id: HashMap<usize, String>,
    node_id_to_int: HashMap<String, usize>,
    history: History,
    time: SystemTime,
    algos_to_run: AlgoConfig,
    algos_run_mode_auto: bool,
    algo_results: AlgoStore,
}

impl MetaState {
    /// Creates a new MetaState object.
    ///
    /// # Arguments
    ///
    /// * `config_fields` - A HashMap containing the configuration fields.
    /// * `is_save` - A boolean indicating whether the timeline should be saved or not.
    ///
    /// # Returns
    ///
    /// * `MetaState` - A new MetaState object.
    pub fn new(config_fields: HashMap<&str, &str>, is_save: bool) -> Self {
        MetaState {
            timeline: Timeline::new(config_fields, is_save),
            adj_matrix: Vec::new(),
            int_to_node_id: HashMap::new(),
            node_id_to_int: HashMap::new(),
            history: History::new(),
            time: SystemTime::now(),
            algos_to_run: AlgoConfig::new(),
            algos_run_mode_auto: true,
            algo_results: AlgoStore::new(),
        }
    }

    pub fn set_algos(&mut self, algos_bitfield: u8) {
        self.algos_to_run.set_algos(algos_bitfield);
    }
}
