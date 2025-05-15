use log::{error, info};

use crate::state;

pub fn handle_cli_matches(
    app: &mut tauri::App,
    inital_autoconnect_state: &mut state::autoconnect::AutoConnectState,
) -> Result<(), String> {
    use tauri_plugin_cli::CliExt;
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
                    *inital_autoconnect_state =
                        state::autoconnect::AutoConnectState::init(port_name);
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
