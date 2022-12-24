use std::collections::HashMap;

use app::protobufs;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum MeshDeviceStatus {
    DeviceRestarting,
    DeviceDisconnected,
    DeviceConnecting,
    DeviceReconnecting,
    DeviceConnected,
    DeviceConfiguring,
    DeviceConfigured,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeshChannel {
    pub config: protobufs::Channel,
    pub last_interaction: u32, // TODO update this
    pub messages: Vec<MessageWithAck>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeshNode {
    pub device_metrics: Vec<protobufs::DeviceMetrics>, // TODO add timestamp
    pub environment_metrics: Vec<protobufs::EnvironmentMetrics>, // TODO add timestamp
    pub data: protobufs::NodeInfo,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryPacket {
    packet: protobufs::MeshPacket,
    data: protobufs::Telemetry,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeInfoPacket {
    packet: protobufs::MeshPacket,
    data: protobufs::NodeInfo,
}
#[derive(Clone, Debug)]
pub struct UserPacket {
    packet: protobufs::MeshPacket,
    data: protobufs::User,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PositionPacket {
    packet: protobufs::MeshPacket,
    data: protobufs::Position,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessagePacket {
    packet: protobufs::MeshPacket,
    data: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageWithAck {
    packet: MessagePacket,
    ack: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeshDevice {
    pub id: u32,                             // unique id of device
    pub ready: bool,                         // is device configured to participate in mesh
    pub status: MeshDeviceStatus,            // current config status of device
    pub channels: HashMap<u32, MeshChannel>, // channels device is able to access
    pub config: protobufs::LocalConfig,      // local-only device configuration
    // pub module_config: protobufs::LocalModuleConfig,
    pub hardware_info: protobufs::MyNodeInfo, // debug information specific to device
    pub nodes: HashMap<u32, MeshNode>,        // network devices this device has communicated with
    // pub serial_connection: serial_connection::SerialConnection, // * this is not serializable connection used to interact with device
    pub region_unset: bool, // flag for whether device has an unset LoRa region
    pub device_metrics: protobufs::DeviceMetrics, // information about functioning of device (e.g. battery level)
    pub waypoints: HashMap<u32, protobufs::Waypoint>, // updatable GPS positions managed by this device
}

impl MeshDevice {
    // pub fn new() -> Self {}

    pub fn set_ready(&mut self, ready: bool) {
        self.ready = ready;
    }

    pub fn set_status(&mut self, status: MeshDeviceStatus) {
        self.status = status;
    }

    pub fn set_config(&mut self, config: protobufs::Config) {
        if let Some(payload_variant) = config.payload_variant {
            match payload_variant {
                protobufs::config::PayloadVariant::Device(device) => {
                    self.config.device = Some(device);
                }
                protobufs::config::PayloadVariant::Position(position) => {
                    self.config.position = Some(position);
                }
                protobufs::config::PayloadVariant::Power(power) => {
                    self.config.power = Some(power);
                }
                protobufs::config::PayloadVariant::Network(network) => {
                    self.config.network = Some(network);
                }
                protobufs::config::PayloadVariant::Display(display) => {
                    self.config.display = Some(display);
                }
                protobufs::config::PayloadVariant::Lora(lora) => {
                    self.region_unset =
                        lora.region == protobufs::config::lo_ra_config::RegionCode::Unset as i32;
                    self.config.lora = Some(lora);
                }
                protobufs::config::PayloadVariant::Bluetooth(bluetooth) => {
                    self.config.bluetooth = Some(bluetooth);
                }
            }
        }
    }

    // TODO set module config

    pub fn set_hardware_info(&mut self, info: protobufs::MyNodeInfo) {
        self.hardware_info = info;
    }

    pub fn set_device_metrics(&mut self, metrics: TelemetryPacket) {
        // ! This borrowing might not update the node in question
        // let mut origin_node: Option<MeshNode> = self.nodes.iter().find_map(|n| {
        //     if n.data.num != telemetry_origin {
        //         return None;
        //     }

        //     let t: MeshNode = n.clone();
        //     Some(t)
        // });

        // let mut origin_node_result = self.nodes.iter().find(|n| n.data.num = telemetry_origin);
        // let mut origin_node = origin_node_result.as_mut();

        let mut origin_node = self.nodes.get(&metrics.packet.from);

        if origin_node.is_none() {
            let new_node = MeshNode {
                data: protobufs::NodeInfo {
                    num: metrics.packet.from,
                    user: None,
                    position: None,
                    snr: metrics.packet.rx_snr,
                    last_heard: 0, // TODO add time last heard
                    device_metrics: None,
                },
                device_metrics: vec![],
                environment_metrics: vec![],
            };

            println!(
                "Inserting node with id {:?}: {:?}",
                metrics.packet.from, new_node
            );

            // ! self.nodes.insert(metrics.packet.from, new_node);
        }

        // origin_node_result = self.nodes.iter().find(|n| n.data.num != telemetry_origin);
        // origin_node = origin_node_result.as_mut();

        if let Some(node) = origin_node.as_mut() {
            if let Some(variant) = metrics.data.variant {
                match variant {
                    protobufs::telemetry::Variant::DeviceMetrics(device_metrics) => {
                        self.device_metrics.battery_level = device_metrics.battery_level;
                        self.device_metrics.voltage = device_metrics.voltage;
                        self.device_metrics.air_util_tx = device_metrics.air_util_tx;
                        self.device_metrics.channel_utilization =
                            device_metrics.channel_utilization;

                        // ! node.device_metrics
                        // !     .push(protobufs::DeviceMetrics { ..device_metrics });

                        println!(
                            "Adding device metrics to node {:?}: {:?}",
                            metrics.packet.from, device_metrics
                        );
                    }
                    protobufs::telemetry::Variant::EnvironmentMetrics(environment_metrics) => {
                        // ! node.environment_metrics
                        // !     .push(protobufs::EnvironmentMetrics {
                        // !         ..environment_metrics
                        // !     });

                        println!(
                            "Adding environment metrics to node {:?}: {:?}",
                            metrics.packet.from, environment_metrics
                        );
                    }
                }
            }
        }
    }

    pub fn add_channel(&mut self, channel: MeshChannel) {
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
        self.waypoints.insert(waypoint.id, waypoint);
    }

    pub fn add_node_info(&mut self, node_info: NodeInfoPacket) {
        let existing_node = self.nodes.get_mut(&node_info.data.num);

        if let Some(ex_node) = existing_node {
            ex_node.data = node_info.data;
        } else {
            self.nodes.insert(
                node_info.data.num,
                MeshNode {
                    data: node_info.data,
                    device_metrics: vec![],
                    environment_metrics: vec![],
                },
            );
        }
    }

    pub fn add_user(&mut self, user: UserPacket) {
        let existing_node = self.nodes.get(&user.packet.from);

        if let Some(ex_node) = existing_node {
            // ! ex_node.data.user = Some(user.data);
            println!(
                "Updating user of existing node {:?}: {:?}",
                user.packet.from, user.data
            )
        } else {
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
                        last_heard: 0, // TODO set this value better
                        device_metrics: None,
                    },
                },
            );
        }
    }

    pub fn add_position(&mut self, position: PositionPacket) {
        let existing_node = self.nodes.get(&position.packet.from);

        if let Some(ex_node) = existing_node {
            // ! ex_node.data.position = Some(position.data);
            println!(
                "Updating position of existing node {:?}: {:?}",
                position.packet.from, position.data
            )
        } else {
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

    pub fn add_message(&mut self, message: MessageWithAck) {
        let channel = self.channels.get(&message.packet.packet.channel);

        if let Some(ch) = channel {
            println!(
                "Adding message to channel {:?}: {:?}",
                message.packet.packet.channel, message.packet.data
            );
            // ! ch.messages.push(message);
        }
    }

    // TODO add waypoint

    // TODO add device metadata

    pub fn ack_message(&mut self, channel_id: u32, message_id: u32) {
        let channel = self.channels.get(&channel_id);

        if let Some(ch) = channel {
            let message = ch
                .messages
                .iter()
                .find(|m| m.packet.packet.id == message_id);

            if let Some(m) = message {
                // ! m.ack = true;
                println!("Acking message id {:?}: {:?}", message_id, m);
            }
        }
    }
}
