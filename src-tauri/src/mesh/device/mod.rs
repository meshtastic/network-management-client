use app::protobufs;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

use self::helpers::generate_rand_id;

pub mod connection;
pub mod handlers;
pub mod helpers;
pub mod state;

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub enum MeshDeviceStatus {
    DeviceRestarting,
    DeviceDisconnected,
    DeviceConnecting,
    DeviceReconnecting,
    DeviceConnected,
    DeviceConfiguring,
    DeviceConfigured,
}

impl Default for MeshDeviceStatus {
    fn default() -> Self {
        MeshDeviceStatus::DeviceDisconnected
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct MeshChannel {
    pub config: protobufs::Channel,
    pub last_interaction: u32,
    pub messages: Vec<ChannelMessageWithAck>,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct MeshNodeDeviceMetrics {
    metrics: protobufs::DeviceMetrics,
    timestamp: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct MeshNodeEnvironmentMetrics {
    metrics: protobufs::EnvironmentMetrics,
    timestamp: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct MeshNode {
    pub device_metrics: Vec<MeshNodeDeviceMetrics>,
    pub environment_metrics: Vec<MeshNodeEnvironmentMetrics>,
    pub data: protobufs::NodeInfo,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct TelemetryPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::Telemetry,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct UserPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::User,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct PositionPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::Position,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct TextPacket {
    pub packet: protobufs::MeshPacket,
    pub data: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct WaypointPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::Waypoint,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub enum ChannelMessagePayload {
    Text(TextPacket),
    Waypoint(WaypointPacket),
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct ChannelMessageWithAck {
    pub payload: ChannelMessagePayload,
    pub ack: bool,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
#[ts(export)]
pub struct MeshDevice {
    pub config_id: u32,                               // unique id of device
    pub ready: bool,                                  // is device configured to participate in mesh
    pub status: MeshDeviceStatus,                     // current config status of device
    pub channels: HashMap<u32, MeshChannel>,          // channels device is able to access
    pub config: protobufs::LocalConfig,               // local-only device configuration
    pub hardware_info: protobufs::MyNodeInfo,         // debug information specific to device
    pub nodes: HashMap<u32, MeshNode>, // network devices this device has communicated with
    pub region_unset: bool,            // flag for whether device has an unset LoRa region
    pub device_metrics: protobufs::DeviceMetrics, // information about functioning of device (e.g. battery level)
    pub waypoints: HashMap<u32, protobufs::Waypoint>, // updatable GPS positions managed by this device
}

impl MeshDevice {
    pub fn new() -> Self {
        MeshDevice {
            config_id: generate_rand_id(),
            ready: false,
            region_unset: true,
            ..Default::default()
        }
    }
}
