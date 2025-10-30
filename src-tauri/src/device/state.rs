#![allow(dead_code)]

use log::{debug, trace};
use meshtastic::protobufs;

use super::helpers::get_current_time_u32;
use super::{
    ChannelMessagePayload, ChannelMessageWithState, MeshChannel, MeshDevice, MeshNode,
    MeshNodeDeviceMetrics, MeshNodeEnvironmentMetrics, NeighborInfoPacket, NormalizedWaypoint,
    PositionPacket, SerialDeviceStatus, TelemetryPacket, TextPacket, UserPacket, WaypointPacket,
};

use crate::device::{ChannelMessageState, LastHeardMetadata};

impl MeshDevice {
    pub fn set_ready(&mut self, ready: bool) {
        debug!("Set ready: {:?}", ready);
        self.ready = ready;
    }

    pub fn set_status(&mut self, status: SerialDeviceStatus) {
        debug!("Set device status: {:?}", status);
        self.status = status;
    }

    pub fn set_config(&mut self, config: protobufs::Config) {
        debug!("Updating own config");

        if let Some(payload_variant) = config.payload_variant {
            match payload_variant {
                protobufs::config::PayloadVariant::Device(device) => {
                    trace!("Updated own device config: {:?}", device);
                    self.config.device = Some(device);
                }
                protobufs::config::PayloadVariant::Position(position) => {
                    trace!("Updated own position config: {:?}", position);
                    self.config.position = Some(position);
                }
                protobufs::config::PayloadVariant::Power(power) => {
                    trace!("Updated own power config: {:?}", power);
                    self.config.power = Some(power);
                }
                protobufs::config::PayloadVariant::Network(network) => {
                    trace!("Updated own network config: {:?}", network);
                    self.config.network = Some(network);
                }
                protobufs::config::PayloadVariant::Display(display) => {
                    trace!("Updated own display config: {:?}", display);
                    self.config.display = Some(display);
                }
                protobufs::config::PayloadVariant::Lora(lora) => {
                    trace!("Updated own LoRa config: {:?}", lora);
                    self.region_unset =
                        lora.region == protobufs::config::lo_ra_config::RegionCode::Unset as i32;
                    self.config.lora = Some(lora);
                }
                protobufs::config::PayloadVariant::Bluetooth(bluetooth) => {
                    trace!("Updated own bluetooth config: {:?}", bluetooth);
                    self.config.bluetooth = Some(bluetooth);
                }
                protobufs::config::PayloadVariant::Security(security) => {
                    trace!("Updated own security config: {:?}", security);
                    self.config.security = Some(security);
                }
                protobufs::config::PayloadVariant::Sessionkey(session_key) => {
                    trace!("Received session key config: {:?}", session_key);
                }
                protobufs::config::PayloadVariant::DeviceUi(device_ui) => {
                    trace!("Received Device UI config: {:?}", device_ui);
                }
            }
        }
    }

    pub fn set_module_config(&mut self, module_config: protobufs::ModuleConfig) {
        debug!("Updating own module config");

        if let Some(payload_variant) = module_config.payload_variant {
            match payload_variant {
                protobufs::module_config::PayloadVariant::Audio(config) => {
                    trace!("Updated own audio module config: {:?}", config);
                    self.module_config.audio = Some(config);
                }
                protobufs::module_config::PayloadVariant::CannedMessage(config) => {
                    trace!("Updated own canned message module config: {:?}", config);
                    self.module_config.canned_message = Some(config);
                }
                protobufs::module_config::PayloadVariant::ExternalNotification(config) => {
                    trace!(
                        "Updated own external notification module config: {:?}",
                        config
                    );
                    self.module_config.external_notification = Some(config);
                }
                protobufs::module_config::PayloadVariant::Mqtt(config) => {
                    trace!("Updated own mqtt module config: {:?}", config);
                    self.module_config.mqtt = Some(config);
                }
                protobufs::module_config::PayloadVariant::RangeTest(config) => {
                    trace!("Updated own range test module config: {:?}", config);
                    self.module_config.range_test = Some(config);
                }
                protobufs::module_config::PayloadVariant::RemoteHardware(config) => {
                    trace!("Updated own remote hardware module config: {:?}", config);
                    self.module_config.remote_hardware = Some(config);
                }
                protobufs::module_config::PayloadVariant::Serial(config) => {
                    trace!("Updated own serial module config: {:?}", config);
                    self.module_config.serial = Some(config);
                }
                protobufs::module_config::PayloadVariant::StoreForward(config) => {
                    trace!("Updated own store-forward module config: {:?}", config);
                    self.module_config.store_forward = Some(config);
                }
                protobufs::module_config::PayloadVariant::Telemetry(config) => {
                    trace!("Updated own telemetry module config: {:?}", config);
                    self.module_config.telemetry = Some(config);
                }
                protobufs::module_config::PayloadVariant::NeighborInfo(_config) => {}
                protobufs::module_config::PayloadVariant::AmbientLighting(_config) => {}
                protobufs::module_config::PayloadVariant::DetectionSensor(_config) => {}
                protobufs::module_config::PayloadVariant::Paxcounter(_config) => {}
            }
        }
    }

    pub fn set_my_node_info(&mut self, info: protobufs::MyNodeInfo) {
        debug!("Setting own hardware info");
        trace!("{:?}", info);

        self.my_node_info = info;
    }

    pub fn set_device_metrics(&mut self, metrics: TelemetryPacket) {
        let origin_node = self.nodes.get_mut(&metrics.packet.from);

        if let Some(node) = origin_node {
            if let Some(variant) = metrics.data.variant {
                match variant {
                    protobufs::telemetry::Variant::DeviceMetrics(device_metrics) => {
                        debug!("Adding device metrics to node {:?}", metrics.packet.from);
                        trace!("{:?}", device_metrics);

                        self.device_metrics.battery_level = device_metrics.battery_level;
                        self.device_metrics.voltage = device_metrics.voltage;
                        self.device_metrics.air_util_tx = device_metrics.air_util_tx;
                        self.device_metrics.channel_utilization =
                            device_metrics.channel_utilization;

                        node.device_metrics.push(MeshNodeDeviceMetrics {
                            metrics: protobufs::DeviceMetrics { ..device_metrics },
                            timestamp: get_current_time_u32(),
                            snr: metrics.packet.rx_snr,
                        });
                    }
                    protobufs::telemetry::Variant::EnvironmentMetrics(environment_metrics) => {
                        debug!(
                            "Adding environment metrics to node {:?}",
                            metrics.packet.from
                        );
                        trace!("{:?}", environment_metrics);

                        node.environment_metrics.push(MeshNodeEnvironmentMetrics {
                            metrics: protobufs::EnvironmentMetrics {
                                ..environment_metrics
                            },
                            timestamp: get_current_time_u32(),
                            snr: metrics.packet.rx_snr,
                        });
                    }
                    protobufs::telemetry::Variant::AirQualityMetrics(air_quality_metrics) => {
                        debug!("Received air quality metrics, not handling");
                        trace!("{:?}", air_quality_metrics);
                    }
                    protobufs::telemetry::Variant::PowerMetrics(power_metrics) => {
                        debug!("Received power metrics, not handling");
                        trace!("{:?}", power_metrics);
                    }
                    protobufs::telemetry::Variant::LocalStats(local_stats) => {
                        debug!("Received local stats, not handling");
                        trace!("{:?}", local_stats);
                    }
                    protobufs::telemetry::Variant::HealthMetrics(health_metrics) => {
                        debug!("Received health metrics, not handling");
                        trace!("{:?}", health_metrics);
                    }
                    protobufs::telemetry::Variant::HostMetrics(host_metrics) => {
                        debug!("Received host metrics, not handling");
                        trace!("{:?}", host_metrics);
                    }
                }
            }
        } else {
            let new_node = MeshNode {
                node_num: metrics.packet.from,
                last_heard: Some(LastHeardMetadata {
                    timestamp: get_current_time_u32(),
                    snr: metrics.packet.rx_snr,
                    channel: metrics.packet.channel,
                }),
                user: None,
                device_metrics: vec![],
                environment_metrics: vec![],
                position_metrics: vec![],
            };

            debug!(
                "Inserting new node with id {} from metrics",
                metrics.packet.from,
            );
            trace!("{:?}", new_node);

            self.nodes.insert(metrics.packet.from, new_node);
        }
    }

    pub fn add_channel(&mut self, channel: MeshChannel) {
        debug!("Adding device channel at index {}", channel.config.index);
        trace!("{:?}", channel);

        self.channels.insert(
            channel
                .config
                .index
                .try_into()
                .expect("Channel id out of u32 range"),
            channel,
        );
    }

    pub fn add_waypoint(&mut self, waypoint: NormalizedWaypoint) {
        debug!("Adding own managed waypoint: {:?}", waypoint);
        self.waypoints.insert(waypoint.id, waypoint);
    }

    pub fn add_node_info(&mut self, node_info: protobufs::NodeInfo) {
        let found_node = self.nodes.get_mut(&node_info.num);

        if let Some(node) = found_node {
            debug!("Updating existing node with id {} from info", node_info.num,);
            trace!("{:?}", node_info);

            node.update_from_node_info(node_info);
        } else {
            debug!("Inserting new node with id {} from info", node_info.num,);
            trace!("{:?}", node_info);

            let mut new_node = MeshNode::new(node_info.num);
            new_node.update_from_node_info(node_info.clone());

            self.nodes.insert(node_info.num, new_node);
        }
    }

    pub fn add_user(&mut self, user: UserPacket) {
        let found_node = self.nodes.get_mut(&user.packet.from);

        if let Some(node) = found_node {
            trace!(
                "Updating user of existing node {:?}: {:?}",
                user.packet.from,
                user.data
            );
            node.user = Some(user.data);
        } else {
            trace!(
                "Adding user to new node {:?}: {:?}",
                user.packet.from,
                user.data
            );

            let mut new_node = MeshNode::new(self.my_node_info.my_node_num);
            new_node.user = Some(user.data);
            new_node.last_heard = Some(LastHeardMetadata {
                timestamp: get_current_time_u32(),
                snr: user.packet.rx_snr,
                channel: user.packet.channel,
            });

            self.nodes.insert(user.packet.from, new_node);
        }
    }

    pub fn add_position(&mut self, position: PositionPacket) {
        let found_node = self.nodes.get_mut(&position.packet.from);

        if let Some(node) = found_node {
            trace!(
                "Updating position of existing node {:?}: {:?}",
                position.packet.from,
                position.data
            );
            node.position_metrics.push(position.data.into());
        } else {
            trace!(
                "Adding position to new node {:?}: {:?}",
                position.packet.from,
                position.data
            );

            let mut new_node = MeshNode::new(self.my_node_info.my_node_num);
            new_node.position_metrics.push(position.data.into());

            self.nodes.insert(position.packet.from, new_node);
        }
    }

    pub fn add_neighborinfo(&mut self, neighborinfo: NeighborInfoPacket) {
        let result = self
            .neighbors
            .insert(neighborinfo.packet.from, neighborinfo.clone());

        if result.is_some() {
            trace!(
                "Updated neighborinfo of existing node {:?}: {:?}",
                neighborinfo.packet.from,
                neighborinfo.data
            );
        } else {
            trace!(
                "Added neighborinfo to new node {:?}: {:?}",
                neighborinfo.packet.from,
                neighborinfo.data
            );
        }
    }

    pub fn add_text_message(&mut self, message: TextPacket) {
        let channel = self.channels.get_mut(&message.packet.channel);

        if let Some(ch) = channel {
            debug!(
                "Adding text message to channel {:?}: {:?}",
                message.packet.channel, message.data
            );

            ch.last_interaction = get_current_time_u32();

            ch.messages.push(ChannelMessageWithState {
                payload: ChannelMessagePayload::Text(message),
                state: ChannelMessageState::Pending,
            });
        }
    }

    pub fn add_waypoint_message(&mut self, message: WaypointPacket) {
        let channel = self.channels.get_mut(&message.packet.channel);

        if let Some(ch) = channel {
            debug!(
                "Adding waypoint message to channel {:?}: {:?}",
                message.packet.channel, message.data
            );

            ch.last_interaction = get_current_time_u32();

            ch.messages.push(ChannelMessageWithState {
                payload: ChannelMessagePayload::Waypoint(message),
                state: ChannelMessageState::Pending,
            });
        }
    }

    // TODO add device metadata

    pub fn set_message_state(
        &mut self,
        channel_id: u32,
        message_id: u32,
        state: ChannelMessageState,
    ) {
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
                m.state = state;
            }
        }
    }
}
