#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::state::NodeKey;

pub type DiffCenMap = HashMap<NodeKey, HashMap<NodeKey, HashMap<NodeKey, f64>>>;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DiffCenError {
    NodeIdLookupError(u32),
    EigenvalueError(String),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DiffCenResult {
    Success(DiffCenMap),
    Error(DiffCenError),
    Empty(bool),
}

pub type EigenvalsError = String;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum EigenvalsResult {
    Success(Vec<f64>),
    Error(EigenvalsError),
    Empty(bool),
}
