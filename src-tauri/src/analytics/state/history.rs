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
pub struct AlgorithmRunHistory {
    ap_history: Vec<SystemTime>,
    mincut_history: Vec<SystemTime>,
    diff_cent_history: Vec<SystemTime>,
    most_sim_t_history: Vec<SystemTime>,
    pred_stt_history: Vec<SystemTime>,
}

impl AlgorithmRunHistory {
    pub fn new() -> Self {
        AlgorithmRunHistory {
            ap_history: Vec::new(),
            mincut_history: Vec::new(),
            diff_cent_history: Vec::new(),
            most_sim_t_history: Vec::new(),
            pred_stt_history: Vec::new(),
        }
    }

    fn get_last_time_entry(entries: &[SystemTime]) -> Option<std::time::Duration> {
        if let Some(last) = entries.last() {
            return last.elapsed().ok();
        }

        None
    }

    fn log_last_run_time(history: &mut Vec<SystemTime>) -> SystemTime {
        let time = SystemTime::now();
        history.push(time);
        time
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
        Self::log_last_run_time(&mut self.ap_history)
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
        Self::log_last_run_time(&mut self.mincut_history)
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
        Self::log_last_run_time(&mut self.diff_cent_history)
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
        Self::log_last_run_time(&mut self.diff_cent_history)
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
        Self::log_last_run_time(&mut self.pred_stt_history)
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
        Self::get_last_time_entry(&self.ap_history)
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
        Self::get_last_time_entry(&self.mincut_history)
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
        Self::get_last_time_entry(&self.diff_cent_history)
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
        Self::get_last_time_entry(&self.most_sim_t_history)
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
        Self::get_last_time_entry(&self.pred_stt_history)
    }
}
