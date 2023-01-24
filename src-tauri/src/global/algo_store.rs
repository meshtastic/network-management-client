#![allow(dead_code)]

use nalgebra::DMatrix;
use std::collections::HashMap;

use crate::aux_data_structures::stoer_wagner_ds::StoerWagnerGraph;
use crate::graph::{edge::Edge, graph_ds::Graph};
use crate::state_err_enums::diff_cen::DiffCenResult;
use petgraph::graph::NodeIndex;

use crate::algorithms::articulation_point::articulation_point;
use crate::algorithms::diffcen::diffusion_centrality;
use crate::algorithms::stoer_wagner::{recover_mincut, stoer_wagner};

use super::algos_config::AlgoConfig;
use super::history::History;

pub struct AlgoStore {
    pub aps: Option<Vec<petgraph::graph::NodeIndex>>,
    pub mincut: Option<Vec<Edge>>,
    pub diff_cent: DiffCenResult,
    pub most_sim_t: Option<Graph>,
    pub pred_state: Option<Graph>,
}

impl AlgoStore {
    pub fn new() -> Self {
        AlgoStore {
            aps: None,
            mincut: None,
            diff_cent: DiffCenResult::Error("Empty".to_string()),
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

    pub fn get_diff_cent(&self) -> &DiffCenResult {
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

    pub fn set_diff_cent(&mut self, diff_cent: DiffCenResult) {
        self.diff_cent = diff_cent;
    }

    pub fn set_most_sim_t(&mut self, most_sim_t: Graph) {
        self.most_sim_t = Some(most_sim_t);
    }

    pub fn set_pred_state(&mut self, pred_state: Graph) {
        self.pred_state = Some(pred_state);
    }
}
