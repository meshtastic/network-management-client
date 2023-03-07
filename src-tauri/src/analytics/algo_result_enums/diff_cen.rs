use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub enum DiffCenResult {
    Success(HashMap<String, HashMap<String, HashMap<String, f64>>>),
    Error(String),
    Empty(bool),
}

impl Clone for DiffCenResult {
    fn clone(&self) -> Self {
        match self {
            DiffCenResult::Success(diff_cen_res) => DiffCenResult::Success(diff_cen_res.clone()),
            DiffCenResult::Error(err) => DiffCenResult::Error(err.clone()),
            DiffCenResult::Empty(empty) => DiffCenResult::Empty(*empty),
        }
    }
}
