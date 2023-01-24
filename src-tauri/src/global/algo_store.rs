#![allow(dead_code)]

use nalgebra::DMatrix;
use std::collections::HashMap;

use crate::aux_data_structures::stoer_wagner_ds::StoerWagnerGraph;
use crate::graph::{edge::Edge, graph_ds::Graph};
use crate::state_err_enums::ap::APResult;
use crate::state_err_enums::diff_cen::DiffCenResult;
use crate::state_err_enums::mincut::MinCutResult;
use crate::state_err_enums::most_sim_timeline::MostSimTResult;
use crate::state_err_enums::pred_state::PredStateResult;
use petgraph::graph::NodeIndex;

use crate::algorithms::articulation_point::articulation_point;
use crate::algorithms::diffcen::diffusion_centrality;
use crate::algorithms::stoer_wagner::{recover_mincut, stoer_wagner};

use super::algos_config::AlgoConfig;
use super::history::History;

pub struct AlgoStore {
    pub aps: APResult,
    pub mincut: MinCutResult,
    pub diff_cent: DiffCenResult,
    pub most_sim_t: MostSimTResult,
    pub pred_state: PredStateResult,
}

impl AlgoStore {
    pub fn new() -> Self {
        AlgoStore {
            aps: APResult::Error("Empty".to_string()),
            mincut: MinCutResult::Error("Empty".to_string()),
            diff_cent: DiffCenResult::Error("Empty".to_string()),
            most_sim_t: MostSimTResult::Error("Empty".to_string()),
            pred_state: PredStateResult::Error("Empty".to_string()),
        }
    }

    pub fn get_aps(&self) -> &APResult {
        &self.aps
    }

    pub fn get_mincut(&self) -> &MinCutResult {
        &self.mincut
    }

    pub fn get_diff_cent(&self) -> &DiffCenResult {
        &self.diff_cent
    }

    pub fn get_most_sim_t(&self) -> &MostSimTResult {
        &self.most_sim_t
    }

    pub fn get_pred_state(&self) -> &PredStateResult {
        &self.pred_state
    }

    pub fn set_aps(&mut self, aps: Vec<NodeIndex>) {
        self.aps = APResult::Success(aps);
    }

    pub fn set_mincut(&mut self, mincut: Vec<Edge>) {
        self.mincut = MinCutResult::Success(mincut);
    }

    pub fn set_diff_cent(&mut self, diff_cent: DiffCenResult) {
        self.diff_cent = diff_cent;
    }

    pub fn set_most_sim_t(&mut self, most_sim_t: Graph) {
        self.most_sim_t = MostSimTResult::Success(most_sim_t);
    }

    pub fn set_pred_state(&mut self, pred_state: Graph) {
        self.pred_state = PredStateResult::Success(pred_state);
    }
}
