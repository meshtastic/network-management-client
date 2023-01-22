#![allow(dead_code)]

use std::collections::HashMap;

use crate::graph::{edge::Edge, graph_ds::Graph};
use petgraph::graph::NodeIndex;

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
