use prost_build;
// use prost_wkt_build::*;
use std::{env, path::PathBuf};
use walkdir::WalkDir;

fn main() -> std::io::Result<()> {
    // Allows protobuf compilation without installing the `protoc` binary
    let protoc_path = protoc_bin_vendored::protoc_bin_path().unwrap();
    std::env::set_var("PROTOC", protoc_path);

    let protobufs_dir = "protobufs";
    let mut protos = vec![];

    for entry in WalkDir::new("protobufs")
        .into_iter()
        .map(|e| e.unwrap())
        .filter(|e| {
            e.path()
                .extension()
                .map_or(false, |ext| ext.to_str().unwrap() == "proto")
        })
    {
        let path = entry.path();
        protos.push(path.to_owned());
    }

    prost_build::compile_protos(&protos, &[protobufs_dir]).unwrap();

    // let out = PathBuf::from(env::var("OUT_DIR").unwrap());
    // let descriptor_file = out.join("descriptors.bin");
    // let mut prost_build = prost_build::Config::new();
    // prost_build
    //     .type_attribute(".", "#[derive(serde::Serialize,serde::Deserialize)]")
    //     .extern_path(".google.protobuf.Any", "::prost_wkt_types::Any")
    //     .extern_path(".google.protobuf.Timestamp", "::prost_wkt_types::Timestamp")
    //     .extern_path(".google.protobuf.Value", "::prost_wkt_types::Value")
    //     .file_descriptor_set_path(&descriptor_file)
    //     .compile_protos(&protos, &[protobufs_dir])
    //     .unwrap();

    // let descriptor_bytes = std::fs::read(descriptor_file).unwrap();

    // let descriptor = FileDescriptorSet::decode(&descriptor_bytes[..]).unwrap();

    // prost_wkt_build::add_serde(out, descriptor);
    tauri_build::build();

    Ok(())
}
