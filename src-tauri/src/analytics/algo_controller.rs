use super::algo_result_enums::ap::APResult;
use super::algo_result_enums::diff_cen::{DiffCenError, DiffCenResult};
use super::algo_result_enums::eigenvals::EigenvalsResult;
use super::algo_result_enums::mincut::MinCutResult;
use super::algo_result_enums::sw_cut::SWCutResult;
use super::algo_store::AlgoStore;
use super::algorithms::articulation_point::articulation_point;
use super::algorithms::diffcen::diffusion_centrality;
use super::algorithms::stoer_wagner::{recover_mincut, stoer_wagner};
use super::algos_config::{AlgoConfig, Params};
use super::aux_data_structures::stoer_wagner_ds::StoerWagnerGraph;
use super::history::History;
use crate::graph::graph_ds::Graph;

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
        algo_conf: &AlgoConfig,
        history: &mut History,
        store: &mut AlgoStore,
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
        articulation_point(graph)
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
        let sw_graph = &mut StoerWagnerGraph::new(g.clone());
        let _mincut_res = stoer_wagner(sw_graph);
        match _mincut_res {
            SWCutResult::Success(_mincut) => {
                let mut nodes_string = Vec::new();
                for node in g.get_nodes() {
                    nodes_string.push(node.name.clone());
                }
                recover_mincut(sw_graph, nodes_string)
            }
            SWCutResult::Error(er_str) => MinCutResult::Error(er_str),
            SWCutResult::Empty(b) => MinCutResult::Empty(b),
        }
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
        let n = g.get_order();
        let (_, int_to_node_id, d_adj) = g.convert_to_adj_matrix();
        let eigenvals_res = g.eigenvals(&d_adj);

        match eigenvals_res {
            EigenvalsResult::Success(eigenvals_vec) => {
                let diff_cent =
                    diffusion_centrality(&d_adj, int_to_node_id, params, eigenvals_vec, n).unwrap();
                DiffCenResult::Success(diff_cent)
            }
            EigenvalsResult::Error(er_str) => {
                DiffCenResult::Error(DiffCenError::EigenvalueError(er_str))
            }
            EigenvalsResult::Empty(b) => DiffCenResult::Empty(b),
        }
    }

    // pub fn run_most_sim_t(&mut self, g: &Graph, params: &Params) {
    //     // TODO
    // }

    // pub fn run_pred_state(&mut self, g: &Graph, params: &Params) {
    //     // TODO
    // }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::graph_ds::Graph;

    #[test]
    fn test_run_controller() {
        let mut algo_controller = AlgoController::new();
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

        let mut algo_config = AlgoConfig::new();
        let history = &mut History::new();
        let store = &mut AlgoStore::new();
        algo_config.set_algos(0b00100);

        algo_controller.run_algos(&graph1, &algo_config, history, store);

        let diff_cent_option = store.get_diff_cent();

        match diff_cent_option {
            DiffCenResult::Success(diff_cent) => {
                println!("Diffusion centrality: {:?}", diff_cent);
            }
            DiffCenResult::Error(err) => {
                panic!("Error in diffusion centrality: {:?}", err);
            }
            DiffCenResult::Empty(_b) => {
                panic!("Empty graph");
            }
        }
    }
}
