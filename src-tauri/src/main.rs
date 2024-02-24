#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod cli;
mod device;
mod graph;
mod ipc;
mod packet_api;
mod state;

use log::{info, LevelFilter};
use meshtastic::ts::specta::{
    export::ts_with_cfg,
    ts::{BigIntExportBehavior, ExportConfiguration, ModuleExportBehavior, TsExportError},
};
use tauri::Manager;
use tauri_plugin_log::LogTarget;

fn export_ts_types(file_path: &str) -> Result<(), TsExportError> {
    let ts_export_config = ExportConfiguration::default()
        .bigint(BigIntExportBehavior::String)
        .modules(ModuleExportBehavior::Enabled);

    ts_with_cfg(file_path, &ts_export_config)
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .target(LogTarget::LogDir)
                .level(LevelFilter::Debug)
                .target(LogTarget::Stdout)
                .level(LevelFilter::Info)
                .target(LogTarget::Webview)
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|_app| {
            info!("Building TS types from Rust");

            #[cfg(debug_assertions)]
            export_ts_types("../src/bindings/index.ts")?;

            Ok(())
        })
        .setup(|app| {
            let initial_mesh_devices_state = state::mesh_devices::MeshDevicesState::new();
            let initial_radio_connections_state =
                state::radio_connections::RadioConnectionsState::new();
            let mut inital_autoconnect_state = state::autoconnect::AutoConnectState::new();
            let initial_graph_state = state::graph::GraphState::new();

            match cli::handle_cli_matches(app, &mut inital_autoconnect_state) {
                Ok(_) => {}
                Err(err) => panic!("Failed to parse CLI args:\n{}", err),
            }

            app.app_handle().manage(initial_mesh_devices_state);
            app.app_handle().manage(initial_radio_connections_state);
            app.app_handle().manage(inital_autoconnect_state); // Needs to be set after being mutated by CLI parser
            app.app_handle().manage(initial_graph_state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ipc::commands::connections::request_autoconnect_port,
            ipc::commands::connections::get_all_serial_ports,
            ipc::commands::connections::connect_to_serial_port,
            ipc::commands::connections::connect_to_tcp_port,
            ipc::commands::connections::drop_device_connection,
            ipc::commands::connections::drop_all_device_connections,
            ipc::commands::mesh::send_text,
            ipc::commands::mesh::send_waypoint,
            ipc::commands::mesh::delete_waypoint,
            ipc::commands::radio::update_device_config,
            ipc::commands::radio::update_device_user,
            ipc::commands::radio::start_configuration_transaction,
            ipc::commands::radio::commit_configuration_transaction,
            ipc::commands::radio::update_device_config_bulk,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
