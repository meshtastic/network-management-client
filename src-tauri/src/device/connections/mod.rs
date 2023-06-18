use app::protobufs;
use async_trait::async_trait;
use prost::Message;

use super::{
    helpers::{generate_rand_id, get_current_time_u32},
    MeshDevice,
};

pub mod helpers;
pub mod serial;
pub mod stream_buffer;
pub mod tcp;

#[derive(Clone, Copy, Debug, Default)]
pub enum PacketDestination {
    Local,
    #[default]
    Broadcast,
    Node(u32),
}

#[async_trait]
pub trait MeshConnection {
    async fn ping_radio(&mut self) -> Result<(), String>;
    async fn disconnect(&mut self) -> Result<(), String>;
    async fn send_raw(&mut self, data: Vec<u8>) -> Result<(), String>;

    // Default implementations

    async fn configure(&mut self, config_id: u32) -> Result<(), String> {
        let to_radio = protobufs::ToRadio {
            payload_variant: Some(protobufs::to_radio::PayloadVariant::WantConfigId(config_id)),
        };

        let packet_buf = to_radio.encode_to_vec();
        self.send_raw(packet_buf).await?;

        Ok(())
    }

    async fn send_text(
        &mut self,
        device: &mut MeshDevice,
        text: String,
        destination: PacketDestination,
        want_ack: bool,
        channel: u32,
    ) -> Result<(), String> {
        let byte_data = text.into_bytes();

        self.send_packet(
            device,
            byte_data,
            protobufs::PortNum::TextMessageApp,
            destination,
            channel,
            want_ack,
            false,
            true,
            None,
            None,
        )
        .await?;

        Ok(())
    }

    async fn send_waypoint(
        &mut self,
        device: &mut MeshDevice,
        waypoint: protobufs::Waypoint,
        destination: PacketDestination,
        want_ack: bool,
        channel: u32,
    ) -> Result<(), String> {
        let mut new_waypoint = waypoint;

        // Waypoint with ID of zero denotes a new waypoint; check whether to generate its ID on backend.
        if new_waypoint.id == 0 {
            new_waypoint.id = generate_rand_id();
        }
        let byte_data = new_waypoint.encode_to_vec();

        self.send_packet(
            device,
            byte_data,
            protobufs::PortNum::WaypointApp,
            destination,
            channel,
            want_ack,
            false,
            true,
            None,
            None,
        )
        .await?;

        Ok(())
    }

    async fn update_device_config(
        &mut self,
        device: &mut MeshDevice,
        config: protobufs::Config,
    ) -> Result<(), String> {
        let config_packet = protobufs::AdminMessage {
            payload_variant: Some(protobufs::admin_message::PayloadVariant::SetConfig(config)),
        };

        let byte_data = config_packet.encode_to_vec();

        self.send_packet(
            device,
            byte_data,
            protobufs::PortNum::AdminApp,
            PacketDestination::Local,
            0,
            true,
            true,
            false,
            None,
            None,
        )
        .await?;

        Ok(())
    }

    async fn update_device_module_config(
        &mut self,
        device: &mut MeshDevice,
        module_config: protobufs::ModuleConfig,
    ) -> Result<(), String> {
        let module_config_packet = protobufs::AdminMessage {
            payload_variant: Some(protobufs::admin_message::PayloadVariant::SetModuleConfig(
                module_config,
            )),
        };

        let byte_data = module_config_packet.encode_to_vec();

        self.send_packet(
            device,
            byte_data,
            protobufs::PortNum::AdminApp,
            PacketDestination::Local,
            0,
            true,
            true,
            false,
            None,
            None,
        )
        .await?;

        Ok(())
    }

    async fn update_device_channel(
        &mut self,
        device: &mut MeshDevice,
        channel: protobufs::Channel,
    ) -> Result<(), String> {
        // Update local DB with channel changes, since channel changes won't restart device

        device.add_channel(super::MeshChannel {
            config: channel.clone(),
            ..Default::default()
        });

        // Tell device to update channels

        let channel_packet = protobufs::AdminMessage {
            payload_variant: Some(protobufs::admin_message::PayloadVariant::SetChannel(
                channel,
            )),
        };

        let byte_data = channel_packet.encode_to_vec();

        self.send_packet(
            device,
            byte_data,
            protobufs::PortNum::AdminApp,
            PacketDestination::Local,
            0,
            true,
            true,
            false,
            None,
            None,
        )
        .await?;

        Ok(())
    }

    async fn update_device_user(
        &mut self,
        device: &mut MeshDevice,
        user: protobufs::User,
    ) -> Result<(), String> {
        let user_packet = protobufs::AdminMessage {
            payload_variant: Some(protobufs::admin_message::PayloadVariant::SetOwner(user)),
        };

        let byte_data = user_packet.encode_to_vec();

        self.send_packet(
            device,
            byte_data,
            protobufs::PortNum::AdminApp,
            PacketDestination::Local,
            0,
            true,
            true,
            false,
            None,
            None,
        )
        .await?;

        Ok(())
    }

    async fn send_packet(
        &mut self,
        device: &mut MeshDevice,
        byte_data: Vec<u8>,
        port_num: protobufs::PortNum,
        destination: PacketDestination,
        channel: u32, // TODO this should be scoped to 0-7
        want_ack: bool,
        want_response: bool,
        echo_response: bool,
        reply_id: Option<u32>,
        emoji: Option<u32>,
    ) -> Result<(), String> {
        // let own_node_id: u32 = self.my_node_info.as_ref().unwrap().my_node_num;
        let own_node_id: u32 = device.my_node_info.my_node_num;

        let packet_destination: u32 = match destination {
            PacketDestination::Local => own_node_id,
            PacketDestination::Broadcast => 0xffffffff,
            PacketDestination::Node(id) => id,
        };

        let mut packet = protobufs::MeshPacket {
            payload_variant: Some(protobufs::mesh_packet::PayloadVariant::Decoded(
                protobufs::Data {
                    portnum: port_num as i32,
                    payload: byte_data,
                    want_response,
                    reply_id: reply_id.unwrap_or(0),
                    emoji: emoji.unwrap_or(0),
                    dest: 0,       // TODO change this
                    request_id: 0, // TODO change this
                    source: 0,     // TODO change this
                },
            )),
            rx_time: 0,   // * not transmitted
            rx_snr: 0.0,  // * not transmitted
            hop_limit: 0, // * not transmitted
            priority: 0,  // * not transmitted
            rx_rssi: 0,   // * not transmitted
            delayed: 0,   // * not transmitted
            from: own_node_id,
            to: packet_destination,
            id: generate_rand_id(),
            want_ack,
            channel,
        };

        if echo_response {
            packet.rx_time = get_current_time_u32();
            device
                .handle_mesh_packet(packet.clone())
                .map_err(|e| e.to_string())?;
        }

        let to_radio = protobufs::ToRadio {
            payload_variant: Some(protobufs::to_radio::PayloadVariant::Packet(packet)),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio
            .encode::<Vec<u8>>(&mut packet_buf)
            .map_err(|e| e.to_string())?;

        self.send_raw(packet_buf).await?;

        Ok(())
    }

    async fn start_configuration_transaction(
        &mut self,
        device: &mut MeshDevice,
    ) -> Result<(), String> {
        if device.config_in_progress {
            return Err("Configuration already in progress".to_string());
        }

        let to_radio = protobufs::AdminMessage {
            payload_variant: Some(protobufs::admin_message::PayloadVariant::BeginEditSettings(
                true,
            )),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio
            .encode::<Vec<u8>>(&mut packet_buf)
            .map_err(|e| e.to_string())?;

        self.send_raw(packet_buf).await?;
        device.config_in_progress = true;

        Ok(())
    }

    async fn commit_configuration_transaction(
        &mut self,
        device: &mut MeshDevice,
    ) -> Result<(), String> {
        if !device.config_in_progress {
            return Err("No configuration in progress".to_string());
        }

        let to_radio = protobufs::AdminMessage {
            payload_variant: Some(
                protobufs::admin_message::PayloadVariant::CommitEditSettings(true),
            ),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio
            .encode::<Vec<u8>>(&mut packet_buf)
            .map_err(|e| e.to_string())?;

        self.send_raw(packet_buf).await?;
        device.config_in_progress = false;

        Ok(())
    }

    async fn set_local_config(
        &mut self,
        device: &mut MeshDevice,
        config: protobufs::LocalConfig,
    ) -> Result<(), String> {
        if let Some(c) = config.bluetooth {
            self.update_device_config(
                device,
                protobufs::Config {
                    payload_variant: Some(protobufs::config::PayloadVariant::Bluetooth(c)),
                },
            )
            .await?;
        }

        if let Some(c) = config.device {
            self.update_device_config(
                device,
                protobufs::Config {
                    payload_variant: Some(protobufs::config::PayloadVariant::Device(c)),
                },
            )
            .await?;
        }

        if let Some(c) = config.display {
            self.update_device_config(
                device,
                protobufs::Config {
                    payload_variant: Some(protobufs::config::PayloadVariant::Display(c)),
                },
            )
            .await?;
        }

        if let Some(c) = config.lora {
            self.update_device_config(
                device,
                protobufs::Config {
                    payload_variant: Some(protobufs::config::PayloadVariant::Lora(c)),
                },
            )
            .await?;
        }

        if let Some(c) = config.network {
            self.update_device_config(
                device,
                protobufs::Config {
                    payload_variant: Some(protobufs::config::PayloadVariant::Network(c)),
                },
            )
            .await?;
        }

        if let Some(c) = config.position {
            self.update_device_config(
                device,
                protobufs::Config {
                    payload_variant: Some(protobufs::config::PayloadVariant::Position(c)),
                },
            )
            .await?;
        }

        if let Some(c) = config.power {
            self.update_device_config(
                device,
                protobufs::Config {
                    payload_variant: Some(protobufs::config::PayloadVariant::Power(c)),
                },
            )
            .await?;
        }

        Ok(())
    }

    async fn set_local_module_config(
        &mut self,
        device: &mut MeshDevice,
        module_config: protobufs::LocalModuleConfig,
    ) -> Result<(), String> {
        if let Some(c) = module_config.audio {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(protobufs::module_config::PayloadVariant::Audio(c)),
                },
            )
            .await?;
        }

        if let Some(c) = module_config.canned_message {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(protobufs::module_config::PayloadVariant::CannedMessage(
                        c,
                    )),
                },
            )
            .await?;
        }

        if let Some(c) = module_config.external_notification {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(
                        protobufs::module_config::PayloadVariant::ExternalNotification(c),
                    ),
                },
            )
            .await?;
        }

        if let Some(c) = module_config.mqtt {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(protobufs::module_config::PayloadVariant::Mqtt(c)),
                },
            )
            .await?;
        }

        if let Some(c) = module_config.range_test {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(protobufs::module_config::PayloadVariant::RangeTest(c)),
                },
            )
            .await?;
        }

        if let Some(c) = module_config.remote_hardware {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(
                        protobufs::module_config::PayloadVariant::RemoteHardware(c),
                    ),
                },
            )
            .await?;
        }

        if let Some(c) = module_config.serial {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(protobufs::module_config::PayloadVariant::Serial(c)),
                },
            )
            .await?;
        }

        if let Some(c) = module_config.store_forward {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(protobufs::module_config::PayloadVariant::StoreForward(
                        c,
                    )),
                },
            )
            .await?;
        }

        if let Some(c) = module_config.telemetry {
            self.update_device_module_config(
                device,
                protobufs::ModuleConfig {
                    payload_variant: Some(protobufs::module_config::PayloadVariant::Telemetry(c)),
                },
            )
            .await?;
        }

        Ok(())
    }

    async fn set_channel_config(
        &mut self,
        device: &mut MeshDevice,
        channel_config: Vec<protobufs::Channel>,
    ) -> Result<(), String> {
        for channel in channel_config {
            self.update_device_channel(device, channel).await?;
        }

        Ok(())
    }
}
