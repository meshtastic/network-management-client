#![allow(clippy::too_many_arguments)]

use crate::mesh::serial_connection::{MeshConnection, PacketDestination, SerialConnection};

use super::helpers::{generate_rand_id, get_current_time_u32};
use super::MeshDevice;
use app::protobufs;
use prost::Message;

impl MeshDevice {
    pub fn send_text(
        &mut self,
        connection: &mut SerialConnection,
        text: String,
        destination: PacketDestination,
        want_ack: bool,
        channel: u32,
    ) -> Result<(), String> {
        let byte_data = text.into_bytes();

        self.send_packet(
            connection,
            byte_data,
            protobufs::PortNum::TextMessageApp,
            destination,
            channel,
            want_ack,
            false,
            true,
            None,
            None,
        )?;

        Ok(())
    }

    pub fn send_waypoint(
        &mut self,
        connection: &mut SerialConnection,
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
            connection,
            byte_data,
            protobufs::PortNum::WaypointApp,
            destination,
            channel,
            want_ack,
            false,
            true,
            None,
            None,
        )?;

        Ok(())
    }

    pub fn update_device_config(
        &mut self,
        connection: &mut SerialConnection,
        config: protobufs::Config,
    ) -> Result<(), String> {
        let config_packet = protobufs::AdminMessage {
            payload_variant: Some(protobufs::admin_message::PayloadVariant::SetConfig(config)),
        };

        let byte_data = config_packet.encode_to_vec();

        self.send_packet(
            connection,
            byte_data,
            protobufs::PortNum::AdminApp,
            PacketDestination::Local,
            0,
            true,
            true,
            false,
            None,
            None,
        )?;

        Ok(())
    }

    pub fn update_device_user(
        &mut self,
        connection: &mut SerialConnection,
        user: protobufs::User,
    ) -> Result<(), String> {
        let user_packet = protobufs::AdminMessage {
            payload_variant: Some(protobufs::admin_message::PayloadVariant::SetOwner(user)),
        };

        let byte_data = user_packet.encode_to_vec();

        self.send_packet(
            connection,
            byte_data,
            protobufs::PortNum::AdminApp,
            PacketDestination::Local,
            0,
            true,
            true,
            false,
            None,
            None,
        )?;

        Ok(())
    }

    pub fn send_packet(
        &mut self,
        connection: &mut SerialConnection,
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
        let own_node_id: u32 = self.my_node_info.my_node_num;

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
            self.handle_mesh_packet(packet.clone())
                .map_err(|e| e.to_string())?;
        }

        let to_radio = protobufs::ToRadio {
            payload_variant: Some(protobufs::to_radio::PayloadVariant::Packet(packet)),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio
            .encode::<Vec<u8>>(&mut packet_buf)
            .map_err(|e| e.to_string())?;

        connection.send_raw(packet_buf)?;

        Ok(())
    }
}
