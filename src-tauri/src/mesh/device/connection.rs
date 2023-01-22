use super::super::serial_connection::{MeshConnection, PacketDestination, SerialConnection};

use super::helpers::{generate_rand_id, get_current_time_u32};
use super::{MeshDevice, TextPacket};
use app::protobufs;
use prost::Message;
use std::error::Error;

impl MeshDevice {
    pub fn send_text(
        &mut self,
        connection: &mut SerialConnection,
        text: String,
        destination: PacketDestination,
        want_ack: bool,
        channel: u32,
    ) -> Result<(), Box<dyn Error>> {
        let byte_data = text.clone().into_bytes();

        self.send_packet(
            connection,
            byte_data,
            protobufs::PortNum::TextMessageApp,
            destination,
            channel,
            want_ack,
            true,
            false,
            None,
            None,
        )?;

        self.add_message(TextPacket {
            packet: protobufs::MeshPacket {
                rx_time: get_current_time_u32(),
                channel,
                ..Default::default()
            },
            data: text.into(),
        });

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
    ) -> Result<(), Box<dyn Error>> {
        // let own_node_id: u32 = self.my_node_info.as_ref().unwrap().my_node_num;
        let own_node_id: u32 = 0;

        let packet_destination: u32 = match destination {
            PacketDestination::SELF => own_node_id,
            PacketDestination::BROADCAST => 0xffffffff,
            PacketDestination::Node(id) => id,
        };

        let packet = protobufs::MeshPacket {
            payload_variant: Some(protobufs::mesh_packet::PayloadVariant::Decoded(
                protobufs::Data {
                    portnum: port_num as i32,
                    payload: byte_data,
                    source: self.config_id,
                    want_response,
                    emoji: emoji.unwrap_or_default(),
                    dest: 0,       // TODO change this
                    request_id: 0, // TODO change this
                    reply_id: 0,   // TODO change this
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

        let to_radio = protobufs::ToRadio {
            payload_variant: Some(protobufs::to_radio::PayloadVariant::Packet(packet)),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio.encode::<Vec<u8>>(&mut packet_buf)?;
        connection.send_raw(packet_buf)?;

        Ok(())
    }
}
