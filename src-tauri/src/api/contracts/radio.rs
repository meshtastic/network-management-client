use serde::{Deserialize, Serialize};
use specta::Type;

use crate::api::primitives::radio::{Config, User};
use crate::state::DeviceKey;
use meshtastic::protobufs;

// Update device config

// NOTE: Protobufs can't implement `Debug` in their current form
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDeviceConfigRequest {
    pub device_key: DeviceKey,
    pub config: Config,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDeviceConfigResponse {} // Empty

// Update device user

// NOTE: Protobufs can't implement `Debug` in their current form
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDeviceUserRequest {
    pub device_key: DeviceKey,
    pub user: User,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDeviceUserResponse {} // Empty

// Start configuration transaction

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct StartConfigurationTransactionRequest {
    pub device_key: DeviceKey,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct StartConfigurationTransactionResponse {} // Empty

// Commit configuration transaction

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CommitConfigurationTransactionRequest {
    pub device_key: DeviceKey,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CommitConfigurationTransactionResponse {} // Empty

// Update device config bulk

// NOTE: Protobufs can't implement `Debug` in their current form
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceBulkConfig {
    pub radio: Option<protobufs::LocalConfig>,
    pub module: Option<protobufs::LocalModuleConfig>,
    pub channels: Option<Vec<protobufs::Channel>>,
}

// NOTE: Protobufs can't implement `Debug` in their current form
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDeviceConfigBulkRequest {
    pub device_key: DeviceKey,
    pub config: DeviceBulkConfig,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDeviceConfigBulkResponse {} // Empty
