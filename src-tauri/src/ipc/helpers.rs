use std::sync::Arc;
use tauri::async_runtime;

use crate::graph;
use crate::ipc::events;
use crate::mesh;
use crate::mesh::device::{MeshDevice, MeshGraph};
use crate::mesh::serial_connection::MeshConnection;

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

pub fn initialize_serial_connection_handlers(
    port_name: String,
    app_handle: tauri::AppHandle,
    mesh_device_arc: Arc<async_runtime::Mutex<Option<MeshDevice>>>,
    mesh_graph_arc: Arc<async_runtime::Mutex<Option<MeshGraph>>>,
) -> Result<
    (
        mesh::serial_connection::SerialConnection,
        mesh::device::MeshDevice,
    ),
    CommandError,
> {
    let mut connection = mesh::serial_connection::SerialConnection::new();
    let new_device = mesh::device::MeshDevice::new();

    connection.connect(app_handle.clone(), port_name, 115_200)?;
    connection.configure(new_device.config_id)?;

    let mut decoded_listener = connection
        .on_decoded_packet
        .as_ref()
        .ok_or("Decoded packet listener not open")?
        .resubscribe();

    let handle = app_handle;

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
                    eprintln!("{:?}", e);
                    continue;
                }
            };
            let mut graph_guard = mesh_graph_arc.lock().await;
            let graph = match graph_guard.as_mut().ok_or("Graph not initialized") {
                Ok(g) => g,
                Err(e) => {
                    eprintln!("{:?}", e);
                    continue;
                }
            };

            let (device_updated, graph_updated) =
                match device.handle_packet_from_radio(variant, Some(handle.clone()), Some(graph)) {
                    Ok(d) => d,
                    Err(e) => {
                        eprintln!("Error transmitting packet: {}", e);
                        continue;
                    }
                };

            println!("Updates: {:?}, {:?}", device_updated, graph_updated);

            if device_updated {
                match events::dispatch_updated_device(handle.clone(), device.clone()) {
                    Ok(_) => (),
                    Err(e) => {
                        eprintln!("Error emitting event to client: {:?}", e.to_string());
                        continue;
                    }
                };
            }

            if graph_updated {
                match events::dispatch_updated_edges(handle.clone(), graph) {
                    Ok(_) => (),
                    Err(e) => {
                        eprintln!("Error emitting event to client: {:?}", e.to_string());
                        continue;
                    }
                };
            }
        }
    });

    Ok((connection, new_device))
}
