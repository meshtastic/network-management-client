use serde::{Deserialize, Serialize};
use specta::Type;

use crate::api::primitives::graph::MeshGraph;

// Get graph state

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GetGraphStateRequest {} // Empty

// NOTE: `MeshGraph` can't implement `Type` or `Debug` in its current form
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetGraphStateResponse {
    pub graph: MeshGraph,
}

// Initialize timeout handler

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct InitializeTimeoutHandlerRequest {} // Empty

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct InitializeTimeoutHandlerResponse {} // Empty

// Stop timeout handler

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct StopTimeoutHandlerRequest {} // Empty

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct StopTimeoutHandlerResponse {} // Empty
