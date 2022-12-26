use app::protobufs;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, time::UNIX_EPOCH};
use ts_rs::TS;

use super::serial_connection::{MeshConnection, SerialConnection};

pub fn get_current_time_u32() -> u32 {
    std::time::SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Could not get time since unix epoch")
        .as_secs()
        .try_into()
        .expect("Could not convert u128 to u32")
}

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
    pub id: u32,                                      // unique id of device
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
            id: SerialConnection::generate_rand_id(),
            ready: false,
            region_unset: true,
            ..Default::default()
        }
    }

    pub fn set_ready(&mut self, ready: bool) {
        println!("Set ready: {:?}", ready);
        self.ready = ready;
    }

    pub fn set_status(&mut self, status: MeshDeviceStatus) {
        println!("Set status: {:?}", status);
        self.status = status;
    }

    pub fn set_config(&mut self, config: protobufs::Config) {
        if let Some(payload_variant) = config.payload_variant {
            match payload_variant {
                protobufs::config::PayloadVariant::Device(device) => {
                    println!("Updated own device config: {:?}", device);
                    self.config.device = Some(device);
                }
                protobufs::config::PayloadVariant::Position(position) => {
                    println!("Updated own position config: {:?}", position);
                    self.config.position = Some(position);
                }
                protobufs::config::PayloadVariant::Power(power) => {
                    println!("Updated own power config: {:?}", power);
                    self.config.power = Some(power);
                }
                protobufs::config::PayloadVariant::Network(network) => {
                    println!("Updated own network config: {:?}", network);
                    self.config.network = Some(network);
                }
                protobufs::config::PayloadVariant::Display(display) => {
                    println!("Updated own display config: {:?}", display);
                    self.config.display = Some(display);
                }
                protobufs::config::PayloadVariant::Lora(lora) => {
                    println!("Updated own LoRa config: {:?}", lora);
                    self.region_unset =
                        lora.region == protobufs::config::lo_ra_config::RegionCode::Unset as i32;
                    self.config.lora = Some(lora);
                }
                protobufs::config::PayloadVariant::Bluetooth(bluetooth) => {
                    println!("Updated own bluetooth config: {:?}", bluetooth);
                    self.config.bluetooth = Some(bluetooth);
                }
            }
        }
    }

    // TODO set module config

    pub fn set_hardware_info(&mut self, info: protobufs::MyNodeInfo) {
        println!("Setting own hardware info: {:?}", info);
        self.hardware_info = info;
    }

    pub fn set_device_metrics(&mut self, metrics: TelemetryPacket) {
        let mut origin_node = self.nodes.get_mut(&metrics.packet.from);

        if origin_node.is_none() {
            let new_node = MeshNode {
                data: protobufs::NodeInfo {
                    num: metrics.packet.from,
                    user: None,
                    position: None,
                    snr: metrics.packet.rx_snr,
                    last_heard: get_current_time_u32(),
                    device_metrics: None,
                },
                device_metrics: vec![],
                environment_metrics: vec![],
            };

            println!(
                "Inserting node with id {:?}: {:?}",
                metrics.packet.from, new_node
            );

            self.nodes.insert(metrics.packet.from, new_node);
            origin_node = self.nodes.get_mut(&metrics.packet.from);
        }

        if let Some(node) = origin_node {
            if let Some(variant) = metrics.data.variant {
                match variant {
                    protobufs::telemetry::Variant::DeviceMetrics(device_metrics) => {
                        self.device_metrics.battery_level = device_metrics.battery_level;
                        self.device_metrics.voltage = device_metrics.voltage;
                        self.device_metrics.air_util_tx = device_metrics.air_util_tx;
                        self.device_metrics.channel_utilization =
                            device_metrics.channel_utilization;

                        println!(
                            "Adding device metrics to node {:?}: {:?}",
                            metrics.packet.from, device_metrics
                        );

                        node.device_metrics.push(MeshNodeDeviceMetrics {
                            metrics: protobufs::DeviceMetrics { ..device_metrics },
                            timestamp: get_current_time_u32(),
                        });
                    }
                    protobufs::telemetry::Variant::EnvironmentMetrics(environment_metrics) => {
                        println!(
                            "Adding environment metrics to node {:?}: {:?}",
                            metrics.packet.from, environment_metrics
                        );

                        node.environment_metrics.push(MeshNodeEnvironmentMetrics {
                            metrics: protobufs::EnvironmentMetrics {
                                ..environment_metrics
                            },
                            timestamp: get_current_time_u32(),
                        });
                    }
                }
            }
        }
    }

    pub fn add_channel(&mut self, channel: MeshChannel) {
        println!("Adding own channel: {:?}", channel);

        self.channels.insert(
            channel
                .config
                .index
                .try_into()
                .expect("channel id out of u32 range"),
            channel,
        );
    }

    pub fn add_waypoint(&mut self, waypoint: protobufs::Waypoint) {
        println!("Adding own managed waypoint: {:?}", waypoint);
        self.waypoints.insert(waypoint.id, waypoint);
    }

    pub fn add_node_info(&mut self, node_info: protobufs::NodeInfo) {
        let existing_node = self.nodes.get_mut(&node_info.num);

        if let Some(ex_node) = existing_node {
            println!(
                "Setting existing node info {:?}: {:?}",
                node_info.num, node_info
            );
            ex_node.data = node_info;
        } else {
            println!(
                "Inserting new node with info {:?}: {:?}",
                node_info.num, node_info
            );
            self.nodes.insert(
                node_info.num,
                MeshNode {
                    data: node_info,
                    device_metrics: vec![],
                    environment_metrics: vec![],
                },
            );
        }
    }

    pub fn add_user(&mut self, user: UserPacket) {
        let existing_node = self.nodes.get_mut(&user.packet.from);

        if let Some(ex_node) = existing_node {
            println!(
                "Updating user of existing node {:?}: {:?}",
                user.packet.from, user.data
            );
            ex_node.data.user = Some(user.data);
        } else {
            println!(
                "Adding user to new node {:?}: {:?}",
                user.packet.from, user.data
            );
            self.nodes.insert(
                user.packet.from,
                MeshNode {
                    device_metrics: vec![],
                    environment_metrics: vec![],
                    data: protobufs::NodeInfo {
                        num: user.packet.from,
                        user: Some(user.data),
                        position: None,
                        snr: user.packet.rx_snr,
                        last_heard: get_current_time_u32(),
                        device_metrics: None,
                    },
                },
            );
        }
    }

    pub fn add_position(&mut self, position: PositionPacket) {
        let existing_node = self.nodes.get_mut(&position.packet.from);

        if let Some(ex_node) = existing_node {
            println!(
                "Updating position of existing node {:?}: {:?}",
                position.packet.from, position.data
            );
            ex_node.data.position = Some(position.data);
        } else {
            println!(
                "Adding position to new node {:?}: {:?}",
                position.packet.from, position.data
            );
            self.nodes.insert(
                position.packet.from,
                MeshNode {
                    device_metrics: vec![],
                    environment_metrics: vec![],
                    data: protobufs::NodeInfo {
                        num: position.packet.from,
                        user: None,
                        position: Some(position.data),
                        snr: position.packet.rx_snr,
                        last_heard: 0,
                        device_metrics: None,
                    },
                },
            );
        }
    }

    pub fn add_message(&mut self, message: TextPacket) {
        let channel = self.channels.get_mut(&message.packet.channel);

        if let Some(ch) = channel {
            println!(
                "Adding text message to channel {:?}: {:?}",
                message.packet.channel, message.data
            );
            ch.messages.push(ChannelMessageWithAck {
                payload: ChannelMessagePayload::Text(message),
                ack: false,
            });
        }
    }

    pub fn add_waypoint_message(&mut self, message: WaypointPacket) {
        let channel = self.channels.get_mut(&message.packet.channel);

        if let Some(ch) = channel {
            println!(
                "Adding waypoint message to channel {:?}: {:?}",
                message.packet.channel, message.data
            );
            ch.messages.push(ChannelMessageWithAck {
                payload: ChannelMessagePayload::Waypoint(message),
                ack: false,
            });
        }
    }

    // TODO add device metadata

    pub fn ack_message(&mut self, channel_id: u32, message_id: u32) {
        let channel = self.channels.get_mut(&channel_id);

        if let Some(ch) = channel {
            let message = ch
                .messages
                .iter_mut()
                .find(|message| match message.payload.clone() {
                    ChannelMessagePayload::Text(t) => t.packet.id == message_id,
                    ChannelMessagePayload::Waypoint(w) => w.packet.id == message_id,
                });

            if let Some(m) = message {
                println!("Acking message id {:?}: {:?}", message_id, m);
                m.ack = true;
            }
        }
    }
}
