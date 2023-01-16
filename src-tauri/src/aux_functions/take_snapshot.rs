use std::{collections::HashMap, hash::Hash};

use crate::graph::graph_ds::Graph;

/// Returns Haversine distance between 2 nodes using their lat and long
/// https://en.wikipedia.org/wiki/Haversine_formula
///
/// # Arguments
///
/// * `lat1` - latitude of node 1
/// * `lon1` - longitude of node 1
/// * `lat2` - latitude of node 2
/// * `lon2` - longitude of node 2
fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371.0; // radius of the earth in km
    let d_lat = (lat2 - lat1).to_radians();
    let d_lon = (lon2 - lon1).to_radians();
    let a = (d_lat / 2.0).sin().powi(2)
        + (d_lon / 2.0).sin().powi(2) * lat1.to_radians().cos() * lat2.to_radians().cos();
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    r * c
}

/// Returns total distance between 2 nodes using euclidean of haversine and altitude difference.
///
/// # Arguments
///
/// * `lat1` - latitude of node 1
/// * `lon1` - longitude of node 1
/// * `alt1` - altitude of node 1
/// * `lat2` - latitude of node 2
/// * `lon2` - longitude of node 2
/// * `alt2` - altitude of node 2
pub fn total_distance(lat1: f64, lon1: f64, alt1: f64, lat2: f64, lon2: f64, alt2: f64) -> f64 {
    let haversine_distance = haversine_distance(lat1, lon1, lat2, lon2).powi(2);
    let alt_difference = (alt1 - alt2).powi(2);
    (haversine_distance + alt_difference).sqrt()
}

fn save_relative_ordering(graph: &Graph, graph_text: &mut String) {
    let mut nodes = graph.get_nodes().clone();
    let node_fts: HashMap<String, String> = take_snapshot_of_node_fts(graph);

    let smallest_longitude_node = nodes.iter().fold(nodes[0].clone(), |acc, node| {
        if node.longitude < acc.longitude {
            node.clone()
        } else {
            acc
        }
    });

    // sort nodes by their haversine distance to the smallest longitude node
    nodes.sort_by(|a, b| {
        let a_distance = total_distance(
            smallest_longitude_node.latitude,
            smallest_longitude_node.longitude,
            smallest_longitude_node.altitude,
            a.latitude,
            a.longitude,
            a.altitude,
        );
        let b_distance = total_distance(
            smallest_longitude_node.latitude,
            smallest_longitude_node.longitude,
            smallest_longitude_node.altitude,
            b.latitude,
            b.longitude,
            b.altitude,
        );
        a_distance.partial_cmp(&b_distance).unwrap()
    });

    let mut ordering_counter = 0;
    let order = graph.get_order();

    graph_text.push_str(order.to_string().as_str());
    graph_text.push_str("\n");

    for node in nodes {
        graph_text.push_str("O: ");
        graph_text.push_str(&node.name);
        graph_text.push_str(" ");
        graph_text.push_str(ordering_counter.to_string().as_str());
        graph_text.push_str(" ");
        let node_fts_txt = node_fts.get(&node.name).unwrap();
        graph_text.push_str(node_fts_txt);
        ordering_counter += 1;
        graph_text.push_str("\n");
    }
}

/// Converts a graph to a string and returns it
///
/// # Arguments
///
/// * `graph` - the graph to convert
pub fn take_snapshot_of_graph(graph: &Graph) -> String {
    let mut graph_string = "".to_owned();

    save_relative_ordering(graph, &mut graph_string);

    for edge in graph.get_edges() {
        graph_string.push_str("E: ");
        let u_idx = edge.get_u();
        let node_u = graph.get_node(u_idx);
        graph_string.push_str(&node_u.name);
        graph_string.push_str(" ");

        let b_idx = edge.get_v();
        let node_b = graph.get_node(b_idx);
        graph_string.push_str(&node_b.name);
        graph_string.push_str(" ");

        let weight = edge.get_weight();
        graph_string.push_str(&weight.to_string());
        graph_string.push_str("\n");
    }

    graph_string.pop();

    return graph_string;
}

pub fn take_snapshot_of_node_fts(graph: &Graph) -> HashMap<String, String> {
    let mut node_fts: HashMap<String, String> = HashMap::new();

    for node in graph.get_nodes() {
        let mut node_ft_txt: String = "".to_owned();
        node_ft_txt.push_str("lat ");
        node_ft_txt.push_str(&node.latitude.to_string());

        node_ft_txt.push_str(" lon ");
        node_ft_txt.push_str(&node.longitude.to_string());

        node_ft_txt.push_str(" alt ");
        node_ft_txt.push_str(&node.altitude.to_string());

        node_ft_txt.push_str(" v ");
        node_ft_txt.push_str(&node.speed.to_string());

        node_ft_txt.push_str(" th ");
        node_ft_txt.push_str(&node.direction.to_string());

        node_ft_txt.push_str(" deg ");
        node_ft_txt.push_str(&node.optimal_weighted_degree.to_string());

        node_fts.insert(node.name.clone(), node_ft_txt);
    }
    node_fts
}
