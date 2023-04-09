use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub mod commands;
pub mod events;
pub mod helpers;

#[derive(Clone, Debug, Default, Serialize, Deserialize, thiserror::Error)]
#[serde(rename_all = "camelCase")]
pub struct CommandError {
    message: String,
}

impl std::fmt::Display for CommandError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "CommandError: \"{}\"", self.message)
    }
}

impl From<String> for CommandError {
    fn from(value: String) -> Self {
        Self { message: value }
    }
}

impl From<&str> for CommandError {
    fn from(value: &str) -> Self {
        Self {
            message: value.into(),
        }
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct APMincutStringResults {
    ap_result: Vec<u32>,
    mincut_result: Vec<(u32, u32)>,
    diffcen_result: HashMap<u32, HashMap<u32, HashMap<u32, f64>>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigurationStatus {
    pub port_name: String,
    pub successful: bool,
    pub message: Option<String>,
}
