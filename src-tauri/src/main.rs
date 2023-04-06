mod analytics;
mod constructors;
mod data_conversion;
mod graph;
mod ipc;
mod mesh;
mod state;

use log::{debug, error, info};
use std::sync::Arc;
use std::time::SystemTime;
use tauri::{async_runtime, Manager};

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
    match app.get_cli_matches() {
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

fn main() {
    info!("Application starting");

    setup_logger().expect("Logging setup failed");
    debug!("Logger initialized");

    let initial_connection_state = state::ActiveSerialConnection {
        inner: Arc::new(async_runtime::Mutex::new(None)),
    };

    let initial_device_state = state::ActiveMeshDevice {
        inner: Arc::new(async_runtime::Mutex::new(None)),
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
        .setup(|app| {
            match handle_cli_matches(app, &mut inital_autoconnect_state) {
                Ok(_) => {}
                Err(err) => panic!("Failed to parse CLI args:\n{}", err),
            }

            // Manage application state
            app.app_handle().manage(initial_analytics_state);
            app.app_handle().manage(initial_graph_state);
            app.app_handle().manage(initial_connection_state);
            app.app_handle().manage(initial_device_state);

            // Autoconnect port state needs to be set after being mutated by CLI parser
            app.app_handle().manage(inital_autoconnect_state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ipc::commands::request_autoconnect_port,
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
