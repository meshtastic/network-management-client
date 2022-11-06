//use crate::serde::serde_protobuf;
use app::protobufs::{Data, PortNum};
// use serde::serde_protobuf::{Deserialize, Serialize};
//use app::protobufs::mesh::{Data, HardwareModel, Position};

// Take in data from the frontend in protobuf form, parse it, run algorithms on it, and
// send it back.

#[tauri::command]
// pass in protobufs and do things with them; e.g. run different algorithms with different data
pub fn print_protobuf(data: Data) -> Result<Data, String> {
    // let mut data = serde_protobuf::from_bytes::<Data>(&data).unwrap();
    println!("data: {:?}", data);
    return Ok(data);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protobuf_initialization() {
        println!("here goes nothing");
        let mut data = vec![1u8, 2, 3];
        //let portnum = PortNum::UNKNOWN_APP;
        let portnum = PortNum::default();
        let mut payload = Data {
            portnum: 0, //portnum,
            payload: data,
            want_response: false,
            dest: 0,
            source: 1,
            request_id: 0,
            reply_id: 1,
            emoji: 0,
        };
        //   protobuf.portnum = 0;
        //   protobuf.payload = "Hi".to_string();
        //   protobuf.want_response = true;
        //   protobuf.dest = 1;
        //   protobuf.source = 2;
        //   protobuf.request_id = 0;
        //   protobuf.reply_id = 0;
        //   protobuf.emoji = false;
        // );
        print_protobuf(payload);
        // let mut data = Data::new();`
        // let mut hardware_model = HardwareModel::new();
        // let mut position = Position::new();
        // position.set_x(1.0);
        // position.set_y(1.0);
        // position.set_z(1.0);
        // hardware_model.set_position(position);
        // data.set_hardware_model(hardware_model);
        // let data = serde_protobuf::to_vec(&data).unwrap();
        // print_protobuf(data).unwrap();
    }
}
