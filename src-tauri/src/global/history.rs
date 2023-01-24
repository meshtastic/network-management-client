#![allow(dead_code)]
use std::time::SystemTime;

/// A struct that stores the history of the last calculation of each algorithm.
///
/// # Fields
///
/// * `ap_history` - A Vec of SystemTimes representing the history of the last articulation point calculation.
/// * `mincut_history` - A Vec of SystemTimes representing the history of the last mincut calculation.
/// * `diff_cent_history` - A Vec of SystemTimes representing the history of the last diffusion centrality calculation.
/// * `most_sim_t_history` - A Vec of SystemTimes representing the history of the last most similar timeline calculation.
/// * `pred_stt_history` - A Vec of SystemTimes representing the history of the last predicted state calculation.
pub struct History {
    ap_history: Vec<SystemTime>,
    mincut_history: Vec<SystemTime>,
    diff_cent_history: Vec<SystemTime>,
    most_sim_t_history: Vec<SystemTime>,
    pred_stt_history: Vec<SystemTime>,
}

impl History {
    pub fn new() -> Self {
        History {
            ap_history: Vec::new(),
            mincut_history: Vec::new(),
            diff_cent_history: Vec::new(),
            most_sim_t_history: Vec::new(),
            pred_stt_history: Vec::new(),
        }
    }

    /// Logs the time of the last articulation point calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `SystemTime` - The time of the last articulation point calculation.
    pub fn log_ap(&mut self) -> SystemTime {
        self.ap_history.push(SystemTime::now());
        self.ap_history.last().unwrap().clone()
    }

    /// Logs the time of the last mincut calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `SystemTime` - The time of the last mincut calculation.
    pub fn log_mincut(&mut self) -> SystemTime {
        self.mincut_history.push(SystemTime::now());
        self.mincut_history.last().unwrap().clone()
    }

    /// Logs the time of the last diffusion centrality calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `SystemTime` - The time of the last diffusion centrality calculation.
    pub fn log_diff_cent(&mut self) -> SystemTime {
        self.diff_cent_history.push(SystemTime::now());
        self.diff_cent_history.last().unwrap().clone()
    }

    /// Logs the time of the last most similar timeline calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `SystemTime` - The time of the last most similar timeline calculation.
    pub fn log_most_sim_t(&mut self) -> SystemTime {
        self.most_sim_t_history.push(SystemTime::now());
        self.most_sim_t_history.last().unwrap().clone()
    }

    /// Logs the time of the last predicted state calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `SystemTime` - The time of the last predicted state calculation.
    pub fn log_pred_stt(&mut self) -> SystemTime {
        self.pred_stt_history.push(SystemTime::now());
        self.pred_stt_history.last().unwrap().clone()
    }

    /// Returns the history of the articulation point calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Vec<SystemTime>` - The history of the articulation point calculation.
    pub fn get_ap_history(&self) -> &Vec<SystemTime> {
        &self.ap_history
    }

    /// Returns the history of the mincut calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Vec<SystemTime>` - The history of the mincut calculation.
    pub fn get_mincut_history(&self) -> &Vec<SystemTime> {
        &self.mincut_history
    }

    /// Returns the history of the diffusion centrality calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Vec<SystemTime>` - The history of the diffusion centrality calculation.
    pub fn get_diffusion_centrality_history(&self) -> &Vec<SystemTime> {
        &self.diff_cent_history
    }

    /// Returns the history of the most similar timeline calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Vec<SystemTime>` - The history of the most similar timeline calculation.
    pub fn get_most_sim_t_history(&self) -> &Vec<SystemTime> {
        &self.most_sim_t_history
    }

    /// Returns the history of the predicted state calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Vec<SystemTime>` - The history of the predicted state calculation.
    pub fn get_pred_stt_history(&self) -> &Vec<SystemTime> {
        &self.pred_stt_history
    }

    /// Returns the last elapsed time of the articulation point calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Option<std::time::Duration>` - The last elapsed time of the articulation point calculation.
    pub fn get_ap_history_last_elapsed(&self) -> Option<std::time::Duration> {
        match self.ap_history.len() {
            0 => None,
            _ => Some(self.ap_history.last().unwrap().elapsed().unwrap()),
        }
    }

    /// Returns the last elapsed time of the mincut calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Option<std::time::Duration>` - The last elapsed time of the mincut calculation.
    pub fn get_mincut_history_last_elapsed(&self) -> Option<std::time::Duration> {
        match self.mincut_history.len() {
            0 => None,
            _ => Some(self.mincut_history.last().unwrap().elapsed().unwrap()),
        }
    }

    /// Returns the last elapsed time of the diffusion centrality calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Option<std::time::Duration>` - The last elapsed time of the diffusion centrality calculation.
    pub fn get_diffusion_centrality_history_last_elapsed(&self) -> Option<std::time::Duration> {
        match self.diff_cent_history.len() {
            0 => None,
            _ => Some(self.diff_cent_history.last().unwrap().elapsed().unwrap()),
        }
    }

    /// Returns the last elapsed time of the most similar timeline calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Option<std::time::Duration>` - The last elapsed time of the most similar timeline calculation.
    pub fn get_most_sim_timeline_history_last_elapsed(&self) -> Option<std::time::Duration> {
        match self.most_sim_t_history.len() {
            0 => None,
            _ => Some(self.most_sim_t_history.last().unwrap().elapsed().unwrap()),
        }
    }

    /// Returns the last elapsed time of the predicted state calculation.
    ///
    /// # Arguments
    ///
    /// * `self` - The history object.
    ///
    /// # Returns
    ///
    /// * `Option<std::time::Duration>` - The last elapsed time of the predicted state calculation.
    pub fn get_predicted_state_history_last_elapsed(&self) -> Option<std::time::Duration> {
        match self.pred_stt_history.len() {
            0 => None,
            _ => Some(self.pred_stt_history.last().unwrap().elapsed().unwrap()),
        }
    }
}
