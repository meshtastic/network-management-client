pub fn format_serial_packet(data: Vec<u8>) -> Vec<u8> {
    let magic_buffer = [0x94, 0xc3, 0x00, data.len() as u8];
    let packet_slice = data.as_slice();

    [&magic_buffer, packet_slice].concat()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_empty_packet() {
        let data = vec![];
        let serial_data = format_serial_packet(data);

        assert_eq!(serial_data, vec![0x94, 0xc3, 0x00, 0x00]);
    }

    #[test]
    fn valid_non_empty_packet() {
        let data = vec![0x00, 0xff, 0x88];
        let serial_data = format_serial_packet(data);

        assert_eq!(serial_data, vec![0x94, 0xc3, 0x00, 0x03, 0x00, 0xff, 0x88]);
    }
}
