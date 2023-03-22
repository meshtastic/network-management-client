mod analytics;
mod constructors;
mod data_conversion;
mod graph;
mod ipc;
mod mesh;
mod state;

use std::sync::Arc;
use tauri::{async_runtime, Manager};

fn main() {
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

    tracing_subscriber::fmt::init();
    tauri::Builder::default()
        .setup(|app| {
            match app.get_cli_matches() {
                Ok(matches) => {
                    let args = matches.args;
                    println!("Args: {:?}", args);

                    app.app_handle().manage(initial_analytics_state);
                    app.app_handle().manage(initial_graph_state);
                    app.app_handle().manage(initial_connection_state);
                    app.app_handle().manage(initial_device_state);

                    if let Some(port_arg) = args.get("port") {
                        if let serde_json::Value::String(port_name) = port_arg.value.clone() {
                            println!("Connecting to port: {:?}", port_name);

                            let handle = app.app_handle();

                            let connection_state = handle.state::<state::ActiveSerialConnection>();
                            let device_state = handle.state::<state::ActiveMeshDevice>();
                            let graph_state = handle.state::<state::NetworkGraph>();

                            let (connection, device) =
                                ipc::helpers::initialize_serial_connection_handlers(
                                    port_name,
                                    app.app_handle(),
                                    device_state.inner.clone(),
                                    graph_state.inner.clone(),
                                )?;

                            let connection_arc = connection_state.inner.clone();
                            let device_arc = device_state.inner.clone();

                            // Need this to unlock async locks in sync function
                            tokio::runtime::Builder::new_multi_thread()
                                .enable_all()
                                .build()
                                .unwrap()
                                .block_on(async move {
                                    {
                                        let mut connection_guard = connection_arc.lock().await;
                                        *connection_guard = Some(connection);
                                    }

                                    // Only need to lock to set device in tauri state
                                    {
                                        let mut device_guard = device_arc.lock().await;
                                        *device_guard = Some(device);
                                    }
                                });
                        }
                    }
                }
                Err(err) => {
                    eprintln!("Error parsing CLI arguments: {}", err);
                }
            }

            Ok(())
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
