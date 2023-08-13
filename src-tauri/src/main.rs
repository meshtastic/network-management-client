#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod analytics;
pub mod constructors;
mod data_conversion;
mod device;
mod graph;
mod ipc;
mod state;

use log::{debug, error, info};
use specta::ts::{BigIntExportBehavior, ExportConfiguration, ModuleExportBehavior};
use std::time::SystemTime;
use std::{collections::HashMap, sync::Arc};
use tauri::{async_runtime, Manager};
use tauri_plugin_cli::CliExt;
use tauri_plugin_notification::{NotificationExt, PermissionState};

/// https://docs.rs/fern/0.6.2/fern/
fn setup_logger() -> Result<(), fern::InitError> {
    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "[{} {} {}] {}",
                humantime::format_rfc3339_seconds(SystemTime::now()),
                record.level(),
                record.target(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .chain(std::io::stderr())
        .chain(fern::log_file("output.log")?)
        .apply()?;

    Ok(())
}

fn handle_cli_matches(
    app: &mut tauri::App,
    inital_autoconnect_state: &mut state::AutoConnectState,
) -> Result<(), String> {
    match app.cli().matches() {
        Ok(matches) => {
            let args = matches.args;

            // Check if user has specified a port name to automatically connect to
            // If so, store it for future connection attempts
            if let Some(port_arg) = args.get("port") {
                if port_arg.occurrences == 0 {
                    info!("No occurences of \"port\" CLI argument, skipping...");
                    return Ok(());
                }

                if let serde_json::Value::String(port_name) = port_arg.value.clone() {
                    *inital_autoconnect_state = state::AutoConnectState {
                        inner: Arc::new(async_runtime::Mutex::new(Some(port_name))),
                    };
                }
            }

            Ok(())
        }
        Err(err) => {
            error!("Failed to get CLI matches: {}", err);
            Err(err.to_string())
        }
    }
}

fn export_specta_types(file_path: &str) -> Result<(), specta::ts::TsExportError> {
    let specta_config = ExportConfiguration::default()
        .bigint(BigIntExportBehavior::String)
        .modules(ModuleExportBehavior::Enabled);

    specta::export::ts_with_cfg(file_path, &specta_config)
}

fn main() {
    #[cfg(debug_assertions)]
    setup_logger().expect("Logging setup failed");
    debug!("Logger initialized");

    info!("Building TS types from Rust");

    #[cfg(debug_assertions)]
    export_specta_types("../src/bindings/index.ts").unwrap();

    info!("Application starting");

    let initial_mesh_devices_state = state::MeshDevices {
        inner: Arc::new(async_runtime::Mutex::new(HashMap::new())),
    };

    let initial_radio_connections_state = state::RadioConnections {
        inner: Arc::new(async_runtime::Mutex::new(HashMap::new())),
    };

    let initial_graph_state = state::NetworkGraph {
        inner: Arc::new(async_runtime::Mutex::new(None)),
    };

    let initial_analytics_state = state::AnalyticsState {
        inner: Arc::new(async_runtime::Mutex::new(None)),
    };

    let mut inital_autoconnect_state = state::AutoConnectState {
        inner: Arc::new(async_runtime::Mutex::new(None)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_window::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            match handle_cli_matches(app, &mut inital_autoconnect_state) {
                Ok(_) => {}
                Err(err) => panic!("Failed to parse CLI args:\n{}", err),
            }

            if app.notification().permission_state()? == PermissionState::Unknown {
                app.notification().request_permission()?;
            }

            // Manage application state
            app.app_handle().manage(initial_mesh_devices_state);
            app.app_handle().manage(initial_radio_connections_state);
            app.app_handle().manage(initial_graph_state);
            app.app_handle().manage(initial_analytics_state);

            // Autoconnect port state needs to be set after being mutated by CLI parser
            app.app_handle().manage(inital_autoconnect_state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ipc::commands::connections::request_autoconnect_port,
            ipc::commands::connections::get_all_serial_ports,
            ipc::commands::connections::connect_to_serial_port,
            ipc::commands::connections::connect_to_tcp_port,
            ipc::commands::connections::drop_device_connection,
            ipc::commands::connections::drop_all_device_connections,
            ipc::commands::graph::initialize_graph_state,
            ipc::commands::graph::get_node_edges,
            ipc::commands::graph::run_algorithms,
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
        .expect("error while running tauri application");
}
