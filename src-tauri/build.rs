use prost_build;
use walkdir::WalkDir;

fn main() -> std::io::Result<()> {
    let protobufs_dir = "protobufs/meshtastic/";
    println!("cargo:rerun-if-changed={}", protobufs_dir);

    // Allows protobuf compilation without installing the `protoc` binary
    let protoc_path = protoc_bin_vendored::protoc_bin_path().unwrap();
    std::env::set_var("PROTOC", protoc_path);

    let mut protos = vec![];

    for entry in WalkDir::new(protobufs_dir)
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

    let mut config = prost_build::Config::new();

    config.type_attribute(
        ".",
        "#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS)]",
    );
    config.type_attribute(".", "#[serde(rename_all = \"camelCase\")]");
    config.type_attribute(".", "#[ts(rename_all = \"camelCase\")]");
    config.type_attribute(".", "#[ts(export, export_to = \"bindings/protobufs/\")]");

    config.compile_protos(&protos, &[protobufs_dir]).unwrap();

    tauri_build::build();

    Ok(())
}
