#![allow(dead_code)]

use crate::analytics::data_structures::cut::Cut;
use crate::graph::edge::GraphEdge;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum SWCutResult {
    Success(Cut),
    Error(String),
    Empty(bool),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum MinCutResult {
    Success(Vec<GraphEdge>),
    Error(String),
    Empty(bool),
}
