#![allow(clippy::let_unit_value)]

use crate::analytics::algorithms::articulation_point::results::APResult;
use crate::analytics::algorithms::articulation_point::{
    ArticulationPointParams, ArticulationPointRunner,
};
use crate::analytics::algorithms::diffusion_centrality::results::DiffCenResult;
use crate::analytics::algorithms::diffusion_centrality::{
    DiffusionCentralityParams, DiffusionCentralityRunner,
};
use crate::analytics::algorithms::stoer_wagner::results::MinCutResult;
use crate::analytics::algorithms::stoer_wagner::{GlobalMinCutParams, GlobalMinCutRunner};
use crate::analytics::algorithms::AlgorithmRunner;
use crate::graph::graph_ds::Graph;

use super::configuration::{AlgorithmConfiguration, Params};
use super::history::AlgorithmRunHistory;
use super::store::ResultsStore;

pub struct AlgoController;

impl AlgoController {
    pub fn new() -> Self {
        Self {}
    }

    /// Runs all algorithms that are activated in the AlgoConfig.
    /// The results are stored in the AlgoStore and the History is updated.
    ///
    /// # Arguments
    ///
    /// * `graph` - The graph on which the algorithms are run.
    /// * `algo_conf` - The configuration of the algorithms [`super::algos_config::AlgoConfig`].
    /// * `history` - The history of the algorithms [`super::history::History`].
    /// * `store` - The store of the algorithms [`super::algo_store::AlgoStore`].
    pub fn run_algos(
        &mut self,
        graph: &Graph,
        algo_conf: &AlgorithmConfiguration,
        history: &mut AlgorithmRunHistory,
        store: &mut ResultsStore,
    ) {
        if algo_conf.get_ap_activation() {
            let aps = self.run_ap(graph, algo_conf.get_ap_params());
            store.set_aps(aps);
            history.log_ap();
        }
        if algo_conf.get_mincut_activation() {
            let mincut_edges = self.run_mincut(graph, algo_conf.get_mincut_params());
            store.set_mincut(mincut_edges);
            history.log_mincut();
        }
        if algo_conf.get_diff_cent_activation() {
            let diff_cen_map = self.run_diff_cent(graph, algo_conf.get_diff_cent_params());
            store.set_diff_cent(diff_cen_map);
            history.log_diff_cent();
        }
        if algo_conf.get_most_sim_t_activation() {
            // TODO
        }
        if algo_conf.get_pred_state_activation() {
            // TODO
        }
    }

    /// Runs the articulation point algorithm.
    ///
    /// # Arguments
    ///
    /// * `graph` - The graph on which the algorithm is run.
    /// * `params` - The parameters [`super::algos_config::Params`] of the algorithm.
    ///
    /// # Returns
    ///
    /// APResult - The result of the algorithm. Can be an error too.
    pub fn run_ap(&mut self, graph: &Graph, _params: &Params) -> APResult {
        let params = ArticulationPointParams;
        let mut runner = ArticulationPointRunner::new(params);
        runner.run(graph)
    }

    /// Runs the mincut algorithm.
    ///
    /// # Arguments
    ///
    /// * `graph` - The graph on which the algorithm is run.
    /// * `params` - The parameters [`super::algos_config::Params`] of the algorithm.
    ///
    /// # Returns
    ///
    /// MinCutResult - The result of the algorithm. Can be an error too.
    pub fn run_mincut(&mut self, g: &Graph, _params: &Params) -> MinCutResult {
        let params = GlobalMinCutParams;
        let mut runner = GlobalMinCutRunner::new(params);
        runner.run(g)
    }

    /// Runs the diffusion centrality algorithm.
    ///
    /// # Arguments
    ///
    /// * `graph` - The graph on which the algorithm is run.
    /// * `params` - The parameters [`super::algos_config::Params`] of the algorithm.
    ///
    /// # Returns
    ///
    /// DiffCenResult - The result of the algorithm. Can be an error too.
    pub fn run_diff_cent(&mut self, g: &Graph, params: &Params) -> DiffCenResult {
        let t_param = params.get("T").unwrap_or(&(5_u32)).to_owned();

        let params = DiffusionCentralityParams { t_param };
        let mut runner = DiffusionCentralityRunner::new(params);
        runner.run(g)
    }

    // pub fn run_most_sim_t(&mut self, g: &Graph, params: &Params) {
    //     // TODO
    // }

    // pub fn run_pred_state(&mut self, g: &Graph, params: &Params) {
    //     // TODO
    // }
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use crate::analytics::state::configuration::AlgorithmConfigFlags;
//     use crate::graph::graph_ds::Graph;
//     use crate::state::NodeKey;

//     #[test]
//     fn test_run_controller() {
//         let mut algo_controller = AlgoController::new();
//         let mut graph1 = Graph::new();

//         // Create a few nodes and edges and add to graph
//         let u: NodeKey = 1;
//         let v: NodeKey = 2;
//         let w: NodeKey = 3;

//         let _u_idx = graph1.add_node(u.clone());
//         let _v_idx = graph1.add_node(v.clone());
//         let _w_idx = graph1.add_node(w.clone());

//         graph1.add_edge(u.clone(), v.clone(), 1_f64);
//         graph1.add_edge(u, w.clone(), 7_f64);
//         graph1.add_edge(v, w, 35_f64);

//         let mut algo_config = AlgorithmConfiguration::new();
//         let history = &mut AlgorithmRunHistory::new();
//         let store = &mut ResultsStore::new();

//         algo_config.set_algorithm_flags(AlgorithmConfigFlags {
//             articulation_point: None,
//             diffusion_centrality: Some(true),
//             global_mincut: None,
//             most_similar_timeline: None,
//             predicted_state: None,
//         });

//         algo_controller.run_algos(&graph1, &algo_config, history, store);

//         let diff_cent_option = store.get_diff_cent();

//         match diff_cent_option {
//             DiffCenResult::Success(diff_cent) => {
//                 println!("Diffusion centrality: {:?}", diff_cent);
//             }
//             DiffCenResult::Error(err) => {
//                 panic!("Error in diffusion centrality: {:?}", err);
//             }
//             DiffCenResult::Empty(_b) => {
//                 panic!("Empty graph");
//             }
//         }
//     }
// }
