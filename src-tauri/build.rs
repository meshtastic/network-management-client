use prost_build;
use walkdir::WalkDir;

fn main() -> std::io::Result<()> {
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
    tauri_build::build();

    Ok(())
}
