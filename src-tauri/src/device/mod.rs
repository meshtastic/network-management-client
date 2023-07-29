#![allow(non_snake_case)]

use app::protobufs;
use log::trace;
use petgraph::stable_graph::{EdgeIndex, NodeIndex};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio_util::time::DelayQueue;

use self::helpers::{
    convert_location_field_to_protos, generate_rand_id, get_current_time_u32,
    normalize_location_field,
};
use crate::constructors::init::init_edge_map::init_edge_map;
use crate::constructors::init::init_graph::init_graph;
use crate::graph::graph_ds::Graph;

pub mod connections;
pub mod handlers;
pub mod helpers;
pub mod state;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, specta::Type)]
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

#[derive(Clone, Debug, Default, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MeshChannel {
    pub config: protobufs::Channel,
    pub last_interaction: u32,
    pub messages: Vec<ChannelMessageWithState>,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MeshNodeDeviceMetrics {
    metrics: protobufs::DeviceMetrics,
    timestamp: u32,
    snr: f32,
    // channel: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MeshNodeEnvironmentMetrics {
    metrics: protobufs::EnvironmentMetrics,
    timestamp: u32,
    snr: f32,
    // channel: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MeshNodePositionMetrics {
    metrics: NormalizedPosition,
    timestamp: u32,
    snr: f32,
    // channel: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct LastHeardMetadata {
    pub timestamp: u32,
    pub snr: f32,
    pub channel: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MeshNode {
    pub node_num: u32,
    pub last_heard: Option<LastHeardMetadata>,
    pub user: Option<protobufs::User>,
    pub device_metrics: Vec<MeshNodeDeviceMetrics>,
    pub environment_metrics: Vec<MeshNodeEnvironmentMetrics>,
    pub position_metrics: Vec<NormalizedPosition>,
}

impl MeshNode {
    pub fn new(node_num: u32) -> Self {
        Self {
            node_num,
            last_heard: None,
            user: None,
            device_metrics: Vec::new(),
            environment_metrics: Vec::new(),
            position_metrics: Vec::new(),
        }
    }

    pub fn update_from_node_info(&mut self, node_info: protobufs::NodeInfo) {
        self.last_heard = Some(LastHeardMetadata {
            timestamp: get_current_time_u32(),
            snr: node_info.snr,
            channel: node_info.channel,
        });

        if let Some(user) = node_info.user {
            self.user = Some(user);
        }

        if let Some(device_metrics) = node_info.device_metrics {
            self.device_metrics.push(MeshNodeDeviceMetrics {
                metrics: device_metrics,
                timestamp: get_current_time_u32(),
                snr: node_info.snr,
            });
        }

        if let Some(position) = node_info.position {
            self.position_metrics.push(position.into());
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NormalizedNodeInfo {
    /// The node number
    pub num: u32,

    /// The user info for this node
    pub user: Option<protobufs::User>,

    /// This position data. Note: before 1.2.14 we would also store the last time we've heard from this node in position.time, that is no longer true.
    /// Position.time now indicates the last time we received a POSITION from that node.
    pub position: Option<protobufs::Position>,

    /// Returns the Signal-to-noise ratio (SNR) of the last received message,
    /// as measured by the receiver. Return SNR of the last received message in dB
    pub snr: f32,

    /// Set to indicate the last time we received a packet from this node
    pub last_heard: u32,

    /// The latest device metrics for the node.
    pub device_metrics: Option<protobufs::DeviceMetrics>,

    /// local channel index we heard that node on. Only populated if its not the default channel.
    pub channel: u32,
}

/// Currently a re-export of `protobufs::Position` with normalized lat, long
#[derive(Clone, Debug, Default, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NormalizedPosition {
    pub latitude: f32,
    pub longitude: f32,
    pub altitude: i32,
    pub time: u32, // secs
    pub location_source: protobufs::position::LocSource,
    pub altitude_source: protobufs::position::AltSource,
    pub timestamp: u32, // secs
    pub timestamp_millis_adjust: i32,
    pub altitude_hae: i32,
    pub altitude_geoidal_separation: i32,
    pub pdop: u32,
    pub hdop: u32,
    pub vdop: u32,
    pub gps_accuracy: u32,
    pub ground_speed: u32,
    pub ground_track: u32,
    pub fix_quality: u32,
    pub fix_type: u32,
    pub sats_in_view: u32,
    pub sensor_id: u32,
    pub next_update: u32, // secs
    pub seq_number: u32,
}

impl From<protobufs::Position> for NormalizedPosition {
    fn from(position: protobufs::Position) -> Self {
        Self {
            latitude: normalize_location_field(position.latitude_i),
            longitude: normalize_location_field(position.longitude_i),
            altitude: position.altitude,
            time: position.time,
            location_source: protobufs::position::LocSource::from_i32(position.location_source)
                .expect("Could not convert i32 to LocSource"),
            altitude_source: protobufs::position::AltSource::from_i32(position.altitude_source)
                .expect("Could not convert i32 to AltSource"),
            timestamp: position.timestamp,
            timestamp_millis_adjust: position.timestamp_millis_adjust,
            altitude_hae: position.altitude_hae,
            altitude_geoidal_separation: position.altitude_geoidal_separation,
            pdop: position.pdop,
            hdop: position.hdop,
            vdop: position.vdop,
            gps_accuracy: position.gps_accuracy,
            ground_speed: position.ground_speed,
            ground_track: position.ground_track,
            fix_quality: position.fix_quality,
            fix_type: position.fix_type,
            sats_in_view: position.sats_in_view,
            sensor_id: position.sensor_id,
            next_update: position.next_update,
            seq_number: position.seq_number,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::Telemetry,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct UserPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::User,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct PositionPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::Position,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NeighborInfoPacket {
    pub packet: protobufs::MeshPacket,
    pub data: protobufs::NeighborInfo,
}
#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct TextPacket {
    pub packet: protobufs::MeshPacket,
    pub data: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct WaypointPacket {
    pub packet: protobufs::MeshPacket,
    pub data: NormalizedWaypoint,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NormalizedWaypoint {
    /// The waypoint's unique identifier
    pub id: u32,

    /// Latitude of the waypoint
    pub latitude: f32,

    /// Longitude of the waypoint
    pub longitude: f32,

    /// Expire time of waypoint in seconds since epoch
    pub expire: u32,

    /// Id of the node the waypoint is locked to.
    /// Waypoint can be edited by any node if this is 0
    pub locked_to: u32,

    /// Name of the waypoint (max 30 chars)
    pub name: String,

    /// Description of the waypoint (max 100 chars)
    pub description: String,

    /// Icon for the waypoint in the form of a unicode emoji
    pub icon: u32,
}

impl From<protobufs::Waypoint> for NormalizedWaypoint {
    fn from(waypoint: protobufs::Waypoint) -> Self {
        Self {
            id: waypoint.id,
            // Converting to f64 first to cover entire i32 range
            latitude: normalize_location_field(waypoint.latitude_i),
            longitude: normalize_location_field(waypoint.longitude_i),
            expire: waypoint.expire,
            locked_to: waypoint.locked_to,
            name: waypoint.name,
            description: waypoint.description,
            icon: waypoint.icon,
        }
    }
}

impl Into<protobufs::Waypoint> for NormalizedWaypoint {
    fn into(self) -> protobufs::Waypoint {
        protobufs::Waypoint {
            id: self.id,
            // Converting to f64 first to cover entire i32 range
            latitude_i: convert_location_field_to_protos(self.latitude),
            longitude_i: convert_location_field_to_protos(self.longitude),
            expire: self.expire,
            locked_to: self.locked_to,
            name: self.name,
            description: self.description,
            icon: self.icon,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum ChannelMessagePayload {
    Text(TextPacket),
    Waypoint(WaypointPacket),
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub enum ChannelMessageState {
    Pending,
    Acknowledged,
    Error(String),
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct ChannelMessageWithState {
    pub payload: ChannelMessagePayload,
    pub state: ChannelMessageState,
}

// TODO can't deserialize `SerialConnection`
#[derive(Clone, Debug, Default, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MeshDevice {
    pub config_id: u32,             // unique identifier for configuration flow packets
    pub ready: bool,                // is device configured to participate in mesh
    pub status: SerialDeviceStatus, // current config status of device
    pub channels: HashMap<u32, MeshChannel>, // channels device is able to access
    pub config: protobufs::LocalConfig, // local-only device configuration
    pub module_config: protobufs::LocalModuleConfig, // configuration for meshtastic modules
    pub my_node_info: protobufs::MyNodeInfo, // debug information specific to device
    pub nodes: HashMap<u32, MeshNode>, // network devices this device has communicated with
    pub region_unset: bool,         // flag for whether device has an unset LoRa region
    pub device_metrics: protobufs::DeviceMetrics, // information about functioning of device (e.g. battery level)
    pub waypoints: HashMap<u32, NormalizedWaypoint>, // updatable GPS positions managed by this device
    pub neighbors: HashMap<u32, NeighborInfoPacket>, //updated packets from each node containing their neighbors
    pub config_in_progress: bool, // flag for whether the user has started a configuration transaction
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

#[derive(Debug)]
pub struct MeshGraph {
    pub graph: Graph,
    node_expirations: DelayQueue<NodeIndex>,
    edge_expirations: DelayQueue<EdgeIndex>,
}

impl MeshGraph {
    pub fn new() -> Self {
        Self {
            graph: Graph::new(),
            node_expirations: DelayQueue::new(),
            edge_expirations: DelayQueue::new(),
        }
    }

    pub fn regenerate_graph_from_device_info(&mut self, device: &MeshDevice) {
        let edge_hashmap = init_edge_map(&device.neighbors);
        self.graph = init_graph(&edge_hashmap, &device.nodes);
        trace!("Graph: {:?}", self.graph);
    }
}
