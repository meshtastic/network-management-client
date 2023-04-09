#![allow(dead_code)]

use crate::analytics::algorithms::articulation_point::results::APResult;
use crate::analytics::algorithms::diffusion_centrality::results::DiffCenResult;
use crate::analytics::algorithms::most_similar_timeline::results::MostSimTResult;
use crate::analytics::algorithms::predicted_state::results::PredStateResult;
use crate::analytics::algorithms::stoer_wagner::results::MinCutResult;

use crate::graph::graph_ds::Graph;
use serde::{Deserialize, Serialize};

/// Stores the results of the algorithms.
///
/// # Fields
///
/// * `aps` - [`crate::state_err_enums::ap::APResult`] that stores Success/Error/Empty states of articulation point algorithm.
/// * `mincut` - [`crate::state_err_enums::mincut::MinCutResult`] that stores Success/Error/Empty of minimum cut algorithm.
/// * `diff_cent` - [`crate::state_err_enums::diff_cen::DiffCenResult`] that stores Success/Error/Empty of diffusion centrality algorithm.
/// * `most_sim_t` - [`crate::state_err_enums::most_sim_timeline::MostSimTResult`] that stores Success/Error/Empty of most similar timeline algorithm.
/// * `pred_state` - [`crate::state_err_enums::pred_state::PredStateResult`] that stores Success/Error/Empty of state prediction algorithm.

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResultsStore {
    pub aps: APResult,
    pub mincut: MinCutResult,
    pub diff_cent: DiffCenResult,
    pub most_sim_t: MostSimTResult,
    pub pred_state: PredStateResult,
}

impl ResultsStore {
    pub fn new() -> Self {
        ResultsStore {
            aps: APResult::Empty(true),
            mincut: MinCutResult::Empty(true),
            diff_cent: DiffCenResult::Empty(true),
            most_sim_t: MostSimTResult::Empty(true),
            pred_state: PredStateResult::Empty(true),
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

    pub fn set_aps(&mut self, aps: APResult) {
        self.aps = aps;
    }

    pub fn set_mincut(&mut self, mincut: MinCutResult) {
        self.mincut = mincut;
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
