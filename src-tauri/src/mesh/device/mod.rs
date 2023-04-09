use app::protobufs;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use self::helpers::generate_rand_id;
use crate::graph::graph_ds::Graph;

pub mod connection;
pub mod handlers;
pub mod helpers;
pub mod state;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum SerialDeviceStatus {
    Restarting,   // unused
    Disconnected, // no attempt or failure to connect
    Connecting,   // connection initialized, not yet configured
    Reconnecting, // unused
    Connected,    // successful serial connection and device configuration, UI notified
    Configuring,  // configuration in process
    Configured,   // configured but UI not yet notified
}

impl Default for SerialDeviceStatus {
    fn default() -> Self {
        SerialDeviceStatus::Disconnected
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeshChannel {
    pub config: protobufs::Channel,
    pub last_interaction: u32,
    pub messages: Vec<ChannelMessageWithState>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeshNodeDeviceMetrics {
    metrics: protobufs::DeviceMetrics,
    timestamp: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeshNodeEnvironmentMetrics {
    metrics: protobufs::EnvironmentMetrics,
    timestamp: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeshNode {
    pub device_metrics: Vec<MeshNodeDeviceMetrics>,
    pub environment_metrics: Vec<MeshNodeEnvironmentMetrics>,
    pub data: protobufs::NodeInfo,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::Telemetry,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::User,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PositionPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::Position,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NeighborInfoPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::NeighborInfo,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TextPacket {
    pub packet: protobufs::MeshPacket,
    pub data: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WaypointPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::Waypoint,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum ChannelMessagePayload {
    Text(TextPacket),
    Waypoint(WaypointPacket),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ChannelMessageState {
    Pending,
    Acknowledged,
    Error(String),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelMessageWithState {
    pub payload: ChannelMessagePayload,
    pub state: ChannelMessageState,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeshDevice {
    pub config_id: u32,             // unique identifier for configuration flow packets
    pub ready: bool,                // is device configured to participate in mesh
    pub status: SerialDeviceStatus, // current config status of device
    pub channels: HashMap<u32, MeshChannel>, // channels device is able to access
    pub config: protobufs::LocalConfig, // local-only device configuration
    pub my_node_info: protobufs::MyNodeInfo, // debug information specific to device
    pub nodes: HashMap<u32, MeshNode>, // network devices this device has communicated with
    pub region_unset: bool,         // flag for whether device has an unset LoRa region
    pub device_metrics: protobufs::DeviceMetrics, // information about functioning of device (e.g. battery level)
    pub waypoints: HashMap<u32, protobufs::Waypoint>, // updatable GPS positions managed by this device
    pub neighbors: HashMap<u32, protobufs::NeighborInfo>, //updated packets from each node containing their neighbors
}

impl MeshDevice {
    pub fn new() -> Self {
        Self {
            config_id: generate_rand_id(),
            ready: false,
            region_unset: true,
            ..Default::default()
        }
    }
}

/*
 * Just as the MeshDevice struct contains all the information about a device (in raw packet form)
 * the MeshGraph struct contains the network info in raw graph form. This is synchronized with
 * the MeshDevice struct, and is used to generate the graph visualization/algorithm
 * results (see analytics).
 */

#[derive(Clone, Debug)]
pub struct MeshGraph {
    pub graph: Graph,
}

impl MeshGraph {
    pub fn new() -> Self {
        Self {
            graph: Graph::new(),
        }
    }
}
