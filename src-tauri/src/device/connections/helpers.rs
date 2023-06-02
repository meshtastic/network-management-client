use app::protobufs;
use log::{debug, error, info, warn};
use prost::Message;
use tokio::sync::broadcast;

pub fn format_data_packet(data: Vec<u8>) -> Vec<u8> {
    let magic_buffer = [0x94, 0xc3, 0x00, data.len() as u8];
    let packet_slice = data.as_slice();

    [&magic_buffer, packet_slice].concat()
}

pub fn process_serial_bytes(
    transform_serial_buf: &mut Vec<u8>,
    decoded_packet_tx: &broadcast::Sender<protobufs::FromRadio>,
    message: Vec<u8>,
) {
    let mut message = message;
    transform_serial_buf.append(&mut message);
    let mut processing_exhausted = false;

    // While there are still bytes in the buffer and processing isn't completed,
    // continue processing the buffer
    while !transform_serial_buf.is_empty() && !processing_exhausted {
        let processing_result =
            process_packet_buffer(transform_serial_buf, &mut processing_exhausted);

        if let Some(decoded_packet) = processing_result {
            match decoded_packet_tx.send(decoded_packet) {
                Ok(_) => continue,
                Err(_) => break,
            };
        }
    }
}

fn process_packet_buffer(
    transform_serial_buf: &mut Vec<u8>,
    processing_exhausted: &mut bool,
) -> Option<protobufs::FromRadio> {
    // All valid packets start with the sequence [0x94 0xc3 size_msb size_lsb], where
    // size_msb and size_lsb collectively give the size of the incoming packet
    // Note that the maximum packet size currently stands at 240 bytes, meaning an MSB is not needed
    let framing_index = match transform_serial_buf.iter().position(|&b| b == 0x94) {
        Some(idx) => idx,
        None => {
            warn!("Could not find index of 0x94");
            *processing_exhausted = true;
            return None;
        }
    };

    let framing_byte = match transform_serial_buf.get(framing_index + 1) {
        Some(val) => val,
        None => {
            debug!("Found incomplete packet");
            *processing_exhausted = true;
            return None;
        }
    };

    if *framing_byte != 0xc3 {
        warn!("Framing byte [{}] not equal to 0xc3", framing_byte);
        *processing_exhausted = true;
        return None;
    }

    // Drop beginning of buffer if the framing byte is found later in the buffer
    // It is not possible to make a valid packet if the framing byte is not at the beginning
    if framing_index > 0 {
        debug!(
            "Found framing byte at index {}, shifting buffer",
            framing_index
        );

        *transform_serial_buf = transform_serial_buf[framing_index..].to_vec();
    }

    let msb = match transform_serial_buf.get(2) {
        Some(val) => val,
        None => {
            warn!("Could not find value for MSB");
            *processing_exhausted = true;
            return None;
        }
    };

    let lsb = match transform_serial_buf.get(3) {
        Some(val) => val,
        None => {
            warn!("Could not find value for LSB");
            *processing_exhausted = true;
            return None;
        }
    };

    // Combine MSB and LSB of incoming packet size bytes
    // * NOTE: packet size doesn't consider the first four magic bytes
    let shifted_msb: u32 = (*msb as u32).checked_shl(8).unwrap_or(0);
    let incoming_packet_size: usize = 4 + shifted_msb as usize + (*lsb as usize);

    if transform_serial_buf.len() < incoming_packet_size {
        warn!("Serial buffer size is less than size of packet");
        *processing_exhausted = true;
        return None;
    }

    // Get packet data, excluding magic bytes
    let packet: Vec<u8> = transform_serial_buf[4..incoming_packet_size].to_vec();

    // Packet is malformed if the start of another packet occurs within the
    // defined limits of the current packet
    let malformed_packet_detector_index = packet.iter().position(|&b| b == 0x94);

    let malformed_packet_detector_byte = if let Some(index) = malformed_packet_detector_index {
        packet.get(index + 1)
    } else {
        None
    };

    if *malformed_packet_detector_byte.unwrap_or(&0) == 0xc3 {
        info!("Detected malformed packet, purging");

        // ! This is dicey, should be abstracted into a function that returns an option
        let next_packet_start_idx: usize = malformed_packet_detector_index
            .expect("Failed to get index of malformed packet detector");

        // Remove malformed packet from buffer
        *transform_serial_buf = transform_serial_buf[next_packet_start_idx..].to_vec();

        return None;
    }

    let start_of_next_packet_idx: usize = 3 + (shifted_msb as usize) + ((*lsb) as usize) + 1; // ? Why this way?

    // Remove valid packet from buffer
    *transform_serial_buf = transform_serial_buf[start_of_next_packet_idx..].to_vec();

    let decoded_packet = match protobufs::FromRadio::decode(packet.as_slice()) {
        Ok(d) => d,
        Err(err) => {
            error!("FromRadio packet deserialize failed: {:?}", err);
            return None;
        }
    };

    Some(decoded_packet)
}

#[cfg(test)]
mod tests {
    use app::protobufs;
    use prost::Message;
    use tokio::sync::broadcast;

    use crate::device::connections::helpers::format_data_packet;

    use super::*;

    fn mock_encoded_from_radio_packet(
        id: u32,
        payload_variant: protobufs::from_radio::PayloadVariant,
    ) -> (protobufs::FromRadio, Vec<u8>) {
        let packet = protobufs::FromRadio {
            id,
            payload_variant: Some(payload_variant),
        };

        (packet.clone(), packet.encode_to_vec())
    }

    #[tokio::test]
    async fn decodes_valid_buffer_single_packet() {
        // Packet setup

        let payload_variant =
            protobufs::from_radio::PayloadVariant::MyInfo(protobufs::MyNodeInfo {
                my_node_num: 1,
                ..Default::default()
            });

        let (packet, packet_data) = mock_encoded_from_radio_packet(1, payload_variant);
        let encoded_packet = format_data_packet(packet_data);

        let mut mock_serial_buf: Vec<u8> = vec![];
        let (mock_tx, mut mock_rx) = broadcast::channel::<protobufs::FromRadio>(32);

        // Attempt to decode packet

        process_serial_bytes(&mut mock_serial_buf, &mock_tx, encoded_packet);

        assert_eq!(mock_rx.recv().await.unwrap(), packet);
        assert_eq!(mock_serial_buf.len(), 0);
    }

    #[tokio::test]
    async fn decodes_valid_buffer_two_packets() {
        // Packet setup

        let payload_variant1 =
            protobufs::from_radio::PayloadVariant::MyInfo(protobufs::MyNodeInfo {
                my_node_num: 1,
                ..Default::default()
            });

        let payload_variant2 =
            protobufs::from_radio::PayloadVariant::MyInfo(protobufs::MyNodeInfo {
                my_node_num: 2,
                ..Default::default()
            });

        let (packet1, packet_data1) = mock_encoded_from_radio_packet(1, payload_variant1);
        let (packet2, packet_data2) = mock_encoded_from_radio_packet(2, payload_variant2);

        let mut encoded_packet1 = format_data_packet(packet_data1);
        let encoded_packet2 = format_data_packet(packet_data2);

        let mut mock_serial_buf: Vec<u8> = vec![];
        mock_serial_buf.append(&mut encoded_packet1);
        let (mock_tx, mut mock_rx) = broadcast::channel::<protobufs::FromRadio>(32);

        // Attempt to decode packets

        process_serial_bytes(&mut mock_serial_buf, &mock_tx, encoded_packet2);

        assert_eq!(mock_rx.recv().await.unwrap(), packet1);
        assert_eq!(mock_rx.recv().await.unwrap(), packet2);
        assert_eq!(mock_serial_buf.len(), 0);
    }

    #[test]
    fn valid_empty_packet() {
        let data = vec![];
        let serial_data = format_data_packet(data);

        assert_eq!(serial_data, vec![0x94, 0xc3, 0x00, 0x00]);
    }

    #[test]
    fn valid_non_empty_packet() {
        let data = vec![0x00, 0xff, 0x88];
        let serial_data = format_data_packet(data);

        assert_eq!(serial_data, vec![0x94, 0xc3, 0x00, 0x03, 0x00, 0xff, 0x88]);
    }
}
