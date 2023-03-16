mod analytics;
mod constructors;
mod data_conversion;
mod graph;
mod ipc;
mod mesh;
mod state;

use std::sync::Arc;
use tauri::async_runtime;

fn main() {
    tracing_subscriber::fmt::init();
    tauri::Builder::default()
        .manage(state::ActiveSerialConnection {
            inner: Arc::new(async_runtime::Mutex::new(None)),
        })
        .manage(state::ActiveMeshDevice {
            inner: Arc::new(async_runtime::Mutex::new(None)),
        })
        .manage(state::ActiveMeshGraph {
            inner: Arc::new(async_runtime::Mutex::new(None)),
        })
        .manage(state::ActiveMeshState {
            inner: Arc::new(async_runtime::Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            ipc::commands::get_all_serial_ports,
            ipc::commands::connect_to_serial_port,
            ipc::commands::disconnect_from_serial_port,
            ipc::commands::send_text,
            ipc::commands::update_device_config,
            ipc::commands::update_device_user,
            ipc::commands::send_waypoint,
            ipc::commands::get_node_edges,
            ipc::commands::run_algorithms,
            ipc::commands::initialize_graph_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
