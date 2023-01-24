#![allow(dead_code)]

use std::collections::HashMap;
use std::time::SystemTime;

use nalgebra::DMatrix;

use crate::aux_data_structures::eigens::Eigens;
use crate::aux_data_structures::timeline::Timeline;
use crate::aux_functions::adj_matrix::convert_to_adj_matrix;
use crate::global::history::History;

use crate::global::algos_config::AlgoConfig;
use crate::graph::graph_ds::Graph;

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
    eigens: Eigens,
    adj_matrix: Vec<Vec<f64>>,
    d_adj_matrix: Option<DMatrix<f64>>,
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
    pub fn new(config_fields: HashMap<&str, &str>, is_save: bool) -> GlobalState {
        GlobalState {
            timeline: Timeline::new(config_fields, is_save),
            eigens: Eigens::new(),
            adj_matrix: Vec::new(),
            d_adj_matrix: None,
            int_to_node_id: HashMap::new(),
            node_id_to_int: HashMap::new(),
            history: History::new(),
            time: SystemTime::now(),
            algos_to_run: AlgoConfig::new(),
            algos_run_mode_auto: true,
            algo_store: AlgoStore::new(),
        }
    }

    /// Adds a graph to the timeline.
    ///
    /// # Arguments
    ///
    /// * `graph` - A Graph object.
    pub fn add_graph(&mut self, graph: Graph) {
        self.timeline.add_snapshot(&graph);
        self.set_adj_matrix(&graph);
    }

    /// Calculates and sets the adjacency matrix (with relevant aux data structures) for the current graph in timeline.
    /// It also saves DMatrix representation of the adjacency matrix to be used by Eigens.
    ///
    /// # Arguments
    ///
    /// * `graph` - A Graph object.
    fn set_adj_matrix(&mut self, graph: &Graph) {
        let n = graph.get_order();
        let (adj_matrix, int_to_node_id, node_id_to_int) = convert_to_adj_matrix(graph);
        self.adj_matrix = adj_matrix.clone();
        self.int_to_node_id = int_to_node_id;
        self.node_id_to_int = node_id_to_int;
        let flattened_matrix = &adj_matrix
            .iter()
            .map(|row| row.iter())
            .flatten()
            .map(|x| *x)
            .collect::<Vec<f64>>();

        self.d_adj_matrix = Some(DMatrix::from_row_slice(n, n, flattened_matrix));
    }

    /// Calculates and sets (in self.eigens) the eigenvalues of the current graph in timeline.
    /// It uses DMatrix representation hence we expect it to be called after set_adj_matrix.
    fn set_eigenvals_result(&mut self) {
        match self.timeline.get_curr_snapshot() {
            Some(graph) => {
                self.eigens
                    .calc_and_set_eigenvals(self.d_adj_matrix.clone().unwrap());
            }
            None => {}
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
