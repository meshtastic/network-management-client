use std::collections::HashMap;

#[derive(Debug)]
pub enum DiffCenResult {
    Success(HashMap<String, HashMap<String, f64>>),
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
