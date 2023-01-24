#![allow(dead_code)]

use std::collections::HashMap;

use crate::aux_data_structures::stoer_wagner_ds::StoerWagnerGraph;
use crate::graph::{edge::Edge, graph_ds::Graph};
use petgraph::graph::NodeIndex;

use crate::algorithms::articulation_point::articulation_point;
use crate::algorithms::diffcen::diffusion_centrality;
use crate::algorithms::stoer_wagner::{recover_mincut, stoer_wagner};

pub struct AlgoStore {
    pub aps: Option<Vec<petgraph::graph::NodeIndex>>,
    pub mincut: Option<Vec<Edge>>,
    pub diff_cent: Option<HashMap<String, HashMap<String, f64>>>,
    pub most_sim_t: Option<Graph>,
    pub pred_state: Option<Graph>,
}

impl AlgoStore {
    pub fn new() -> Self {
        AlgoStore {
            aps: None,
            mincut: None,
            diff_cent: None,
            most_sim_t: None,
            pred_state: None,
        }
    }

    pub fn run_ap(&mut self, graph: &Graph) {
        let aps = articulation_point(graph);
        self.set_aps(aps);
    }

    pub fn run_mincut(&mut self, g: &Graph) {
        let sw_graph = &mut StoerWagnerGraph::new(g.clone());
        let _mincut = stoer_wagner(sw_graph).unwrap();
        let mut nodes_string = Vec::new();
        for node in g.get_nodes() {
            nodes_string.push(node.name.clone());
        }
        let mincut_edges = recover_mincut(sw_graph, nodes_string);
        self.set_mincut(mincut_edges);
    }

    pub fn run_diff_cent(&mut self, graph: &Graph, T: u32) {
        let diff_cent = diffusion_centrality(graph, T);
        match diff_cent {
            Some(dc) => {
                self.set_diff_cent(dc);
            }
            None => {
                self.set_diff_cent(HashMap::new());
            }
        }
    }

    pub fn get_aps(&self) -> &Option<Vec<NodeIndex>> {
        &self.aps
    }

    pub fn get_mincut(&self) -> &Option<Vec<Edge>> {
        &self.mincut
    }

    pub fn get_diff_cent(&self) -> &Option<HashMap<String, HashMap<String, f64>>> {
        &self.diff_cent
    }

    pub fn get_most_sim_t(&self) -> &Option<Graph> {
        &self.most_sim_t
    }

    pub fn get_pred_state(&self) -> &Option<Graph> {
        &self.pred_state
    }

    pub fn set_aps(&mut self, aps: Vec<NodeIndex>) {
        self.aps = Some(aps);
    }

    pub fn set_mincut(&mut self, mincut: Vec<Edge>) {
        self.mincut = Some(mincut);
    }

    pub fn set_diff_cent(&mut self, diff_cent: HashMap<String, HashMap<String, f64>>) {
        self.diff_cent = Some(diff_cent);
    }

    pub fn set_most_sim_t(&mut self, most_sim_t: Graph) {
        self.most_sim_t = Some(most_sim_t);
    }

    pub fn set_pred_state(&mut self, pred_state: Graph) {
        self.pred_state = Some(pred_state);
    }
}
