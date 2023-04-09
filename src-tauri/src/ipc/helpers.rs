use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use app::protobufs;
use log::{error, info, warn};
use tauri::api::notification::Notification;
use tauri::{async_runtime, Manager};
use tokio::sync::broadcast;

use crate::ipc::events;
use crate::mesh::device::SerialDeviceStatus;
use crate::mesh::serial_connection::MeshConnection;
use crate::{analytics, mesh};
use crate::{graph, state};

use super::CommandError;

pub fn generate_graph_edges_geojson(
    graph: &mut mesh::device::MeshGraph,
) -> geojson::FeatureCollection {
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
    let new_graph = mesh::device::MeshGraph::new();
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
    app_handle: tauri::AppHandle,
    mesh_device: tauri::State<'_, state::ActiveMeshDevice>,
    serial_connection: tauri::State<'_, state::ActiveSerialConnection>,
    mesh_graph: tauri::State<'_, state::NetworkGraph>,
) -> Result<(), CommandError> {
    let mut connection = mesh::serial_connection::SerialConnection::new();
    let mut device = mesh::device::MeshDevice::new();

    device.set_status(SerialDeviceStatus::Connecting);
    connection.connect(app_handle.clone(), port_name, 115_200)?;

    device.set_status(SerialDeviceStatus::Configuring);
    connection.configure(device.config_id)?;

    let decoded_listener = connection
        .on_decoded_packet
        .as_ref()
        .ok_or("Decoded packet listener not open")?
        .resubscribe();

    let handle = app_handle.clone();
    let mesh_device_arc = mesh_device.inner.clone();
    let graph_arc = mesh_graph.inner.clone();

    // Only need to lock to set device in tauri state
    {
        let mut device_guard = mesh_device_arc.lock().await;
        *device_guard = Some(device);
    }

    {
        let mut connection_guard = serial_connection.inner.lock().await;
        *connection_guard = Some(connection);
    }

    spawn_connection_timeout_handler(handle.clone(), mesh_device_arc.clone());
    spawn_decoded_handler(handle, decoded_listener, mesh_device_arc, graph_arc);

    Ok(())
}

fn spawn_connection_timeout_handler(
    handle: tauri::AppHandle,
    mesh_device_arc: Arc<async_runtime::Mutex<Option<mesh::device::MeshDevice>>>,
) {
    tauri::async_runtime::spawn(async move {
        // Wait 1s for device to configure
        tokio::time::sleep(Duration::from_millis(1000)).await;

        let mut device_guard = mesh_device_arc.lock().await;
        let device = match device_guard.as_mut().ok_or("Device not initialized") {
            Ok(d) => d,
            Err(e) => {
                warn!("{}", e);
                return;
            }
        };

        // If device hasn't completed configuration in allotted time,
        // tell UI to disconnect from device (temp workaround before backend disconnect)
        if device.status != SerialDeviceStatus::Configured {
            handle
                .emit_all("device_disconnect", device.status.clone())
                .expect("Failed to dispatch configuration failure message");

            info!("Device configuration timed out, disconnecting device");
            device.set_status(SerialDeviceStatus::Disconnected);
            return;
        }

        // Otherwise, register device as connected
        device.set_status(SerialDeviceStatus::Connected);
    });
}

fn spawn_decoded_handler(
    handle: tauri::AppHandle,
    mut decoded_listener: broadcast::Receiver<protobufs::FromRadio>,
    mesh_device_arc: Arc<async_runtime::Mutex<Option<mesh::device::MeshDevice>>>,
    graph_arc: Arc<async_runtime::Mutex<Option<mesh::device::MeshGraph>>>,
) {
    tauri::async_runtime::spawn(async move {
        while let Ok(message) = decoded_listener.recv().await {
            let variant = match message.payload_variant {
                Some(v) => v,
                None => continue,
            };

            let mut device_guard = mesh_device_arc.lock().await;
            let device = match device_guard.as_mut().ok_or("Device not initialized") {
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
                match events::dispatch_updated_device(handle.clone(), device.clone()) {
                    Ok(_) => (),
                    Err(e) => {
                        error!("Failed to dispatch device to client:\n{}", e);
                        continue;
                    }
                };
            }

            if update_result.regenerate_graph {
                graph.regenerate_graph_from_device_info(device);

                match events::dispatch_updated_edges(handle.clone(), graph) {
                    Ok(_) => (),
                    Err(e) => {
                        error!("Failed to dispatch edges to client:\n{}", e);
                        continue;
                    }
                };
            }

            if let Some(notification_config) = update_result.notification_config {
                match Notification::new(handle.config().tauri.bundle.identifier.clone())
                    .title(notification_config.title)
                    .body(notification_config.body)
                    .notify(&handle)
                {
                    Ok(_) => (),
                    Err(e) => {
                        error!("Failed to send system-level notification:\n{}", e);
                        continue;
                    }
                }
            }
        }
    });
}
