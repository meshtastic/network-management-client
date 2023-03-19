use crate::graph;
use crate::mesh;

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
