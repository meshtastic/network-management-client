#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod api;
mod cli;
mod device;
mod domains;
mod graph;
mod ipc;
mod packet_api;
mod state;

use log::{info, LevelFilter};
use specta::{
    export::ts_with_cfg,
    ts::{BigIntExportBehavior, ExportConfiguration, ModuleExportBehavior, TsExportError},
};
use tauri::Manager;
use tauri_plugin_log::{fern::colors::ColoredLevelConfig, Target, TargetKind};

fn export_ts_types(file_path: &str) -> Result<(), TsExportError> {
    let ts_export_config = ExportConfiguration::default()
        .bigint(BigIntExportBehavior::String)
        .modules(ModuleExportBehavior::Enabled);

    ts_with_cfg(file_path, &ts_export_config)
}

const LOG_LEVEL: LevelFilter = LevelFilter::Debug;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::LogDir {
                        file_name: Some(String::from("meshtastic.log")),
                    }),
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
                .level(LOG_LEVEL)
                .with_colors(ColoredLevelConfig::default())
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // TODO(matthewCmatt): Re-enable Typescript generation
            // info!("Building TS types from Rust");
            // #[cfg(debug_assertions)]
            // export_ts_types("../src/bindings/index.ts")?;

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
            ipc::commands::connections::get_all_bluetooth,
            ipc::commands::connections::get_all_serial_ports,
            ipc::commands::connections::connect_to_bluetooth,
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
            ipc::commands::graph::get_graph_state,
            ipc::commands::graph::initialize_timeout_handler,
            ipc::commands::graph::stop_timeout_handler,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
