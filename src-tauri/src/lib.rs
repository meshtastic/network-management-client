#![allow(non_snake_case)]

pub mod protobufs {
    include!(concat!(env!("OUT_DIR"), "/meshtastic.rs"));
}
