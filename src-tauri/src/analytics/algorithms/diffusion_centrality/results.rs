#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub type DiffCenMap = HashMap<String, HashMap<String, HashMap<String, f64>>>;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DiffCenError {
    NodeIdLookupError(u32),
    EigenvalueError(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub enum DiffCenResult {
    Success(DiffCenMap),
    Error(DiffCenError),
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

#[derive(Debug)]
pub enum EigenvalsResult {
    Success(Vec<f64>),
    Error(String),
    Empty(bool),
}

impl Clone for EigenvalsResult {
    fn clone(&self) -> Self {
        match self {
            EigenvalsResult::Success(eigenvals) => EigenvalsResult::Success(eigenvals.clone()),
            EigenvalsResult::Error(err) => EigenvalsResult::Error(err.clone()),
            EigenvalsResult::Empty(empty) => EigenvalsResult::Empty(*empty),
        }
    }
}
