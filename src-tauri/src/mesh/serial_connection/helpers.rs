pub fn format_serial_packet(data: Vec<u8>) -> Vec<u8> {
    let magic_buffer = [0x94, 0xc3, 0x00, data.len() as u8];
    let packet_slice = data.as_slice();

    [&magic_buffer, packet_slice].concat()
}
