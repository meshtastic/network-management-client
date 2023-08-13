use std::collections::HashMap;
use std::time::Duration;

use app::protobufs;
use log::{debug, error, trace, warn};
use tauri_plugin_notification::NotificationExt;
use tokio::sync::broadcast;

use crate::device::connections::serial::{SerialConnection, SerialConnectionError};
use crate::device::connections::MeshConnection;
use crate::device::SerialDeviceStatus;
use crate::ipc::events::{dispatch_configuration_status, dispatch_rebooting_event};
use crate::ipc::{events, ConfigurationStatus};
use crate::state::DeviceKey;
use crate::{analytics, device};
use crate::{graph, state};

use super::CommandError;

pub fn generate_graph_edges_geojson(graph: &mut device::MeshGraph) -> geojson::FeatureCollection {
    let edge_features: Vec<geojson::Feature> = graph
        .graph
        .get_edges()
        .iter()
        .filter(|e| {
            let u = graph
                .graph
                .get_node(e.u)
                .expect("Index from edge should exist");

            let v = graph
                .graph
                .get_node(e.v)
                .expect("Index from edge should exist");

            u.longitude != 0.0 && u.latitude != 0.0 && v.latitude != 0.0 && v.longitude != 0.0
        })
        .map(|e| {
            let u = graph
                .graph
                .get_node(e.u)
                .expect("Index from edge should exist");

            let v = graph
                .graph
                .get_node(e.v)
                .expect("Index from edge should exist");

            geojson::Feature {
                id: Some(geojson::feature::Id::String(format!(
                    "{}-{}",
                    u.name, v.name
                ))),
                properties: None,
                geometry: Some(geojson::Geometry::new(geojson::Value::LineString(vec![
                    vec![u.longitude, u.latitude, u.altitude],
                    vec![v.longitude, v.latitude, v.altitude],
                ]))),
                ..Default::default()
            }
        })
        .collect();

    geojson::FeatureCollection {
        bbox: None,
        foreign_members: None,
        features: edge_features,
    }
}

pub fn node_index_to_node_id(
    nodeindex: &petgraph::graph::NodeIndex,
    graph: &graph::graph_ds::Graph,
) -> Option<u32> {
    graph.node_idx_map.iter().find_map(|(key, &val)| {
        if val == *nodeindex {
            return key.parse::<u32>().ok();
        }
        None
    })
}

pub async fn initialize_graph_state(
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
    algo_state: tauri::State<'_, state::AnalyticsState>,
) -> Result<(), CommandError> {
    let new_graph = device::MeshGraph::new();
    let state = analytics::state::AnalyticsState::new(HashMap::new(), false);
    let mesh_graph_arc = mesh_graph.inner.clone();
    let algo_state_arc = algo_state.inner.clone();

    {
        let mut new_graph_guard = mesh_graph_arc.lock().await;
        *new_graph_guard = Some(new_graph);
    }

    {
        let mut new_state_guard = algo_state_arc.lock().await;
        *new_state_guard = Some(state);
    }

    Ok(())
}

pub async fn initialize_serial_connection_handlers(
    port_name: String,
    baud_rate: Option<u32>,
    dtr: Option<bool>,
    rts: Option<bool>,
    app_handle: tauri::AppHandle,
    mesh_devices: tauri::State<'_, state::MeshDevices>,
    radio_connections: tauri::State<'_, state::RadioConnections>,
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
) -> Result<(), CommandError> {
    let mut connection = SerialConnection::new();
    let mut device = device::MeshDevice::new();

    device.set_status(SerialDeviceStatus::Connecting);

    match connection
        .connect(
            app_handle.clone(),
            port_name.clone(),
            baud_rate.unwrap_or(115_200),
            dtr.unwrap_or(true),
            rts.unwrap_or(false),
        )
        .await
    {
        Ok(_) => (),
        Err(e) => match e {
            SerialConnectionError::PortOpenError => {
                return Err(
                    "Failed to open serial port. Is this port in use by another program?".into(),
                );
            }
            SerialConnectionError::ConfigurationError => {
                return Err("Failed to configure serial connection. If you encounter this issue repeatedly, please file a bug report.".into());
            }
        },
    };

    // Get copy of decoded_listener by resubscribing
    let decoded_listener = connection
        .on_decoded_packet
        .as_ref()
        .ok_or("Decoded packet listener not open")?
        .resubscribe();

    device.set_status(SerialDeviceStatus::Configuring);
    connection.configure(device.config_id).await?;

    let handle = app_handle.clone();
    let mesh_devices_arc = mesh_devices.inner.clone();
    let radio_connections_arc = radio_connections.inner.clone();
    let graph_arc = mesh_graph.inner.clone();
    // TODO introduce a utility or something that converts an input to a device_key.
    let device_key = port_name.clone();

    // Save device into Tauri state
    {
        let mut devices_guard = mesh_devices_arc.lock().await;
        devices_guard.insert(device_key.clone(), device);
    }

    // Save connection into Tauri state
    {
        let mut connections_guard = radio_connections_arc.lock().await;
        connections_guard.insert(device_key.clone(), Box::new(connection));
    }

    // * Needs the device struct and port name to be loaded into Tauri state before running
    spawn_configuration_timeout_handler(
        handle.clone(),
        mesh_devices_arc.clone(),
        device_key.clone(),
        Duration::from_millis(1500),
    );

    spawn_decoded_handler(
        handle,
        decoded_listener,
        mesh_devices_arc,
        graph_arc,
        port_name,
    );

    Ok(())
}

pub fn spawn_configuration_timeout_handler(
    handle: tauri::AppHandle,
    connected_devices_inner: state::MeshDevicesInner,
    device_key: DeviceKey,
    timeout: Duration,
) {
    trace!("Spawning device configuration timeout");

    tauri::async_runtime::spawn(async move {
        // Wait for device to configure
        tokio::time::sleep(timeout).await;

        trace!("Device configuration timeout completed");

        let mut devices_guard = connected_devices_inner.lock().await;
        let device = match devices_guard
            .get_mut(&device_key)
            .ok_or("Device not initialized")
        {
            Ok(d) => d,
            Err(e) => {
                warn!("{}", e);
                return;
            }
        };

        // If the device is not registered as configuring, take no action
        // since this means the device configuration has succeeded

        if device.status != SerialDeviceStatus::Configuring {
            return;
        }

        // If device hasn't completed configuration in allotted time,
        // tell the UI layer that the configuration failed

        warn!("Device configuration timed out, telling UI to disconnect device");

        dispatch_configuration_status(
            &handle,
            ConfigurationStatus {
                device_key,
                successful: false,
                message: Some(
                    "Configuration timed out. Are you sure this is a Meshtastic device?".into(),
                ),
            },
        )
        .expect("Failed to dispatch configuration failure message");

        trace!("Told UI to disconnect device");
    });
}

pub fn spawn_decoded_handler(
    handle: tauri::AppHandle,
    mut decoded_listener: broadcast::Receiver<protobufs::FromRadio>,
    connected_devices_arc: state::MeshDevicesInner,
    graph_arc: state::NetworkGraphInner,
    device_key: DeviceKey,
) {
    tauri::async_runtime::spawn(async move {
        let handle = handle;

        while let Ok(message) = decoded_listener.recv().await {
            let variant = match message.payload_variant {
                Some(v) => v,
                None => continue,
            };

            let mut devices_guard = connected_devices_arc.lock().await;
            let device = match devices_guard
                .get_mut(&device_key)
                .ok_or("Device not initialized")
            {
                Ok(d) => d,
                Err(e) => {
                    warn!("{}", e);
                    continue;
                }
            };

            let mut graph_guard = graph_arc.lock().await;
            let graph = match graph_guard.as_mut().ok_or("Graph not initialized") {
                Ok(g) => g,
                Err(e) => {
                    warn!("{}", e);
                    continue;
                }
            };

            let update_result = match device.handle_packet_from_radio(variant) {
                Ok(result) => result,
                Err(err) => {
                    warn!("{}", err);
                    continue;
                }
            };

            if update_result.device_updated {
                match events::dispatch_updated_device(&handle, device) {
                    Ok(_) => (),
                    Err(e) => {
                        error!("Failed to dispatch device to client:\n{}", e);
                        continue;
                    }
                };
            }

            if update_result.regenerate_graph {
                graph.regenerate_graph_from_device_info(device);

                match events::dispatch_updated_edges(&handle, graph) {
                    Ok(_) => (),
                    Err(e) => {
                        error!("Failed to dispatch edges to client:\n{}", e);
                        continue;
                    }
                };
            }

            if update_result.configuration_success
                && device.status == SerialDeviceStatus::Configured
            {
                debug!(
                    "Emitting successful configuration of device \"{}\"",
                    device_key.clone()
                );

                dispatch_configuration_status(
                    &handle,
                    ConfigurationStatus {
                        device_key: device_key.clone(),
                        successful: true,
                        message: None,
                    },
                )
                .expect("Failed to dispatch configuration failure message");
                device.set_status(SerialDeviceStatus::Connected);
            }

            if let Some(notification_config) = update_result.notification_config {
                match handle
                    .notification()
                    .builder()
                    .title(notification_config.title)
                    .body(notification_config.body)
                    .show()
                {
                    Ok(_) => (),
                    Err(e) => {
                        error!("Failed to send system-level notification:\n{}", e);
                        continue;
                    }
                }
            }

            if update_result.rebooting {
                debug!("Device rebooting");
                dispatch_rebooting_event(&handle).expect("Failed to dispatch rebooting event");
            }
        }
    });
}
