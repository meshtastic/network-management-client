use app::protobufs;
use log::{debug, error, info, warn};
use prost::Message;
use tokio::sync::mpsc::UnboundedSender;

/// A struct that represents a buffer of bytes received from a radio stream.
/// This struct is used to store bytes received from a radio stream, and is
/// used to incrementally decode bytes from the received stream into valid
/// FromRadio packets.
pub struct StreamBuffer {
    buffer: Vec<u8>,
    decoded_packet_tx: UnboundedSender<protobufs::FromRadio>,
}

#[derive(Debug, Clone)]
/// An enum that represents the possible errors that can occur when processing
/// a stream buffer. These errors are used to determine whether the application
/// should wait to receive more data or if the buffer should be purged.
pub enum StreamBufferError {
    MissingHeaderByte,      // Wait for more data
    IncorrectFramingByte,   // Wait for more data
    IncompletePacket,       // Wait for more data
    MissingMSB,             // Wait for more data
    MissingLSB,             // Wait for more data
    MissingNextPacketIndex, // Wait for more data
    MalformedPacket,        // Don't need more data, purge from buffer
    DecodeFailure,          // Don't need more data, ignore decode failure
}

type Result<T> = std::result::Result<T, StreamBufferError>;

impl StreamBuffer {
    /// Creates a new StreamBuffer instance that will send decoded FromRadio packets
    /// to the given broadcast channel.
    pub fn new(decoded_packet_tx: UnboundedSender<protobufs::FromRadio>) -> Self {
        StreamBuffer {
            buffer: vec![],
            decoded_packet_tx,
        }
    }

    /// Takes in a portion of a stream message, stores it in a buffer,
    /// and attempts to decode the buffer into valid FromRadio packets.
    ///
    /// # Arguments
    ///
    /// * `message` - A vector of bytes received from a radio stream
    ///
    /// # Example
    ///
    /// ```
    /// let (rx, mut tx) = broadcast::channel::<protobufs::FromRadio>(32);
    /// let buffer = StreamBuffer::new(tx);
    ///
    /// while let Some(message) = stream.try_next().await? {
    ///    buffer.process_incoming_bytes(message);
    /// }
    /// ```
    pub fn process_incoming_bytes(&mut self, message: Vec<u8>) {
        let mut message = message;
        self.buffer.append(&mut message);

        // While there are still bytes in the buffer and processing isn't completed,
        // continue processing the buffer
        while !self.buffer.is_empty() {
            let decoded_packet = match self.process_packet_buffer() {
                Ok(packet) => packet,
                Err(err) => match err {
                    StreamBufferError::MissingHeaderByte => break,
                    StreamBufferError::IncorrectFramingByte => break,
                    StreamBufferError::IncompletePacket => break,
                    StreamBufferError::MissingMSB => break,
                    StreamBufferError::MissingLSB => break,
                    StreamBufferError::MissingNextPacketIndex => break,
                    StreamBufferError::MalformedPacket => continue, // Don't need more data to continue
                    StreamBufferError::DecodeFailure => continue, // Don't need more data to continue
                },
            };

            match self.decoded_packet_tx.send(decoded_packet) {
                Ok(_) => continue,
                Err(e) => {
                    error!("Failed to send decoded packet: {}", e.to_string());
                    break;
                }
            };
        }
    }

    /// An internal helper function that is called iteratively on the internal buffer. This
    /// function attempts to decode the buffer into a valid FromRadio packet. This function
    /// will return an error if the buffer does not contain enough data to decode a packet or
    /// if a packet is malformed. This function will return a packet if the buffer contains
    /// enough data to decode a packet, and is able to successfully decode the packet.
    ///
    /// **Note:** This function should only be called when not all received data in the buffer has been processed.
    fn process_packet_buffer(&mut self) -> Result<protobufs::FromRadio> {
        // Check that the buffer can potentially contain a packet header
        if self.buffer.len() < 4 {
            debug!("Buffer data is shorter than packet header size, failing");
            return Err(StreamBufferError::IncompletePacket);
        }

        // All valid packets start with the sequence [0x94 0xc3 size_msb size_lsb], where
        // size_msb and size_lsb collectively give the size of the incoming packet
        // Note that the maximum packet size currently stands at 240 bytes, meaning an MSB is not needed
        let framing_index = match self.buffer.iter().position(|&b| b == 0x94) {
            Some(idx) => idx,
            None => {
                warn!("Could not find index of 0x94, purging buffer");
                self.buffer.clear(); // Clear buffer since no packets exist
                return Err(StreamBufferError::MissingHeaderByte);
            }
        };

        // Get the "framing byte" after the start of the packet header, or fail if not found
        let framing_byte = match self.buffer.get(framing_index + 1) {
            Some(val) => val,
            None => {
                debug!("Could not find framing byte, waiting for more data");
                return Err(StreamBufferError::IncompletePacket);
            }
        };

        // Check that the framing byte is correct, and fail if not
        if *framing_byte != 0xc3 {
            warn!("Framing byte {} not equal to 0xc3", framing_byte);
            return Err(StreamBufferError::IncorrectFramingByte);
        }

        // Drop beginning of buffer if the framing byte is found later in the buffer
        // It is not possible to make a valid packet if the framing byte is not at the beginning
        if framing_index > 0 {
            debug!(
                "Found framing byte at index {}, shifting buffer",
                framing_index
            );

            self.buffer = self.buffer[framing_index..].to_vec();
        }

        // Get the MSB of the packet header size, or wait to receive all data
        let msb = match self.buffer.get(2) {
            Some(val) => val,
            None => {
                warn!("Could not find value for MSB");
                return Err(StreamBufferError::MissingMSB);
            }
        };

        // Get the LSB of the packet header size, or wait to receive all data
        let lsb = match self.buffer.get(3) {
            Some(val) => val,
            None => {
                warn!("Could not find value for LSB");
                return Err(StreamBufferError::MissingLSB);
            }
        };

        // Combine MSB and LSB of incoming packet size bytes
        // Recall that packet size doesn't include the first four magic bytes
        let shifted_msb: u32 = (*msb as u32).checked_shl(8).unwrap_or(0);
        let incoming_packet_size: usize = 4 + shifted_msb as usize + (*lsb as usize);

        // Defer decoding until the correct number of bytes are received
        if self.buffer.len() < incoming_packet_size {
            warn!("Stream buffer size is less than size of packet");
            return Err(StreamBufferError::IncompletePacket);
        }

        // Get packet data, excluding magic bytes
        let packet: Vec<u8> = self.buffer[4..incoming_packet_size].to_vec();

        // Packet is malformed if the start of another packet occurs within the
        // defined limits of the current packet
        let malformed_packet_detector_index = packet.iter().position(|&b| b == 0x94);

        let malformed_packet_detector_byte = if let Some(index) = malformed_packet_detector_index {
            packet.get(index + 1)
        } else {
            None
        };

        // If the byte after the 0x94 is 0xc3, this means not all bytes were received
        // in the current packet, meaning the packet is malformed and should be purged
        if *malformed_packet_detector_byte.unwrap_or(&0) == 0xc3 {
            info!("Detected malformed packet, purging");

            let next_packet_start_idx =
                malformed_packet_detector_index.ok_or(StreamBufferError::MissingNextPacketIndex)?;

            // Remove malformed packet from buffer
            self.buffer = self.buffer[next_packet_start_idx..].to_vec();

            return Err(StreamBufferError::MalformedPacket);
        }

        // Get index of next packet after removing current packet from buffer
        let start_of_next_packet_idx: usize = 3 + (shifted_msb as usize) + ((*lsb) as usize) + 1;

        // Remove current packet from buffer based on start location of next packet
        self.buffer = self.buffer[start_of_next_packet_idx..].to_vec();

        // Attempt to decode the current packet
        let decoded_packet = match protobufs::FromRadio::decode(packet.as_slice()) {
            Ok(d) => d,
            Err(err) => {
                error!("FromRadio packet deserialize failed: {:?}", err);
                return Err(StreamBufferError::DecodeFailure);
            }
        };

        Ok(decoded_packet)
    }
}

#[cfg(test)]
mod tests {
    use app::protobufs;
    use prost::Message;
    use tokio::sync::mpsc::unbounded_channel;

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

        let (mock_tx, mut mock_rx) = unbounded_channel::<protobufs::FromRadio>();

        // Attempt to decode packet

        let mut buffer = StreamBuffer::new(mock_tx);
        buffer.process_incoming_bytes(encoded_packet);

        assert_eq!(mock_rx.recv().await.unwrap(), packet);
        assert_eq!(buffer.buffer.len(), 0);
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

        let (mock_tx, mut mock_rx) = unbounded_channel::<protobufs::FromRadio>();

        // Attempt to decode packets

        let mut buffer = StreamBuffer::new(mock_tx);
        buffer.buffer.append(&mut encoded_packet1);
        buffer.process_incoming_bytes(encoded_packet2);

        assert_eq!(mock_rx.recv().await.unwrap(), packet1);
        assert_eq!(mock_rx.recv().await.unwrap(), packet2);
        assert_eq!(buffer.buffer.len(), 0);
    }
}
