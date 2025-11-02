use serde::{Deserialize, Serialize};
use specta::Type;

use crate::{api::primitives::mesh::Waypoint, state::DeviceKey};

// Send text

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SendTextRequest {
    pub device_key: DeviceKey,
    pub text: String,
    pub channel: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SendTextResponse {} // Empty

// Send waypoint

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SendWaypointRequest {
    pub device_key: DeviceKey,
    pub waypoint: Waypoint,
    pub channel: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SendWaypointResponse {} // Empty

// Delete waypoint

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DeleteWaypointRequest {
    pub device_key: DeviceKey,
    pub waypoint_id: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DeleteWaypointResponse {} // Empty
