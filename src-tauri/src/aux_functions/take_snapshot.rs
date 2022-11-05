use std::{error::Error, fs::File, io::Write};

use crate::graph::graph_ds::Graph;

/// Returns Haversine distance between 2 nodes using their lat and long
/// https://en.wikipedia.org/wiki/Haversine_formula
///
/// # Arguments
///
/// * `lat1` - latitude of node 1
/// * `long1` - longitude of node 1
/// * `lat2` - latitude of node 2
/// * `long2` - longitude of node 2
fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371.0; // radius of the earth in km
    let d_lat = (lat2 - lat1).to_radians();
    let d_lon = (lon2 - lon1).to_radians();
    let a = (d_lat / 2.0).sin().powi(2)
        + (d_lon / 2.0).sin().powi(2) * lat1.to_radians().cos() * lat2.to_radians().cos();
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    r * c
}

fn save_relative_ordering(graph: &Graph, file: &mut File) -> Result<(), Box<dyn Error>> {
    let mut nodes = graph.get_nodes().clone();

    let smallest_longitude_node = nodes.iter().fold(nodes[0].clone(), |acc, node| {
        if node.longitude < acc.longitude {
            node.clone()
        } else {
            acc
        }
    });

    // sort nodes by their haversine distance to the smallest longitude node
    nodes.sort_by(|a, b| {
        let a_distance = haversine_distance(
            smallest_longitude_node.latitude,
            smallest_longitude_node.longitude,
            a.latitude,
            a.longitude,
        );
        let b_distance = haversine_distance(
            smallest_longitude_node.latitude,
            smallest_longitude_node.longitude,
            b.latitude,
            b.longitude,
        );
        a_distance.partial_cmp(&b_distance).unwrap()
    });

    let mut ordering: String = "".to_owned();
    let mut ordering_counter = 0;
    let order = graph.get_order();

    ordering.push_str(order.to_string().as_str());
    ordering.push_str("\n");

    for node in nodes {
        ordering.push_str(&node.name);
        ordering.push_str(" ");
        ordering.push_str(ordering_counter.to_string().as_str());
        ordering_counter += 1;
        ordering.push_str("\n");
    }

    ordering.push_str("\n");

    file.write_all(ordering.as_bytes())
        .expect("Unable to write data");

    Ok(())
}

/// Saves the graph to a file
///
/// # Arguments
///
/// * `graph` - the graph to save
/// * `file_name` - the file to save the graph to
///
/// # Test
///
/// ```rust
/// use graph::graph_ds::Graph;
/// let mut G = Graph::new();
/// let u: String = "u".to_string();
/// let v: String = "v".to_string();
/// let w: String = "w".to_string();
///
/// let mut node_u = Node::new(u.clone());
/// node_u.latitude = 43.71489;
/// node_u.longitude = -72.28486;
/// let _u_idx = G.add_node_from_struct(node_u);
///
/// let mut node_v = Node::new(v.clone());
/// node_v.latitude = 43.71584;
/// node_v.longitude = -72.28239;
/// let _v_idx = G.add_node_from_struct(node_v);
///
/// let mut node_w = Node::new(w.clone());
/// node_w.latitude = 43.7114;
/// node_w.longitude = -72.28332;
/// let _w_idx = G.add_node_from_struct(node_w);
///
/// G.add_edge(u.clone(), v.clone(), 1 as f64);
/// G.add_edge(u.clone(), w.clone(), 1 as f64);
/// G.add_edge(v.clone(), w.clone(), 35 as f64);
///
/// let file_name = "test_graph.txt";
/// save_graph_to_txt_file(&G, file_name).unwrap();
/// ```
pub fn save_graph_to_txt_file(graph: &Graph, file_name: &str) -> Result<(), Box<dyn Error>> {
    let mut file = File::create(file_name)?;

    save_relative_ordering(graph, &mut file)?;

    let mut edges_rep: String = "".to_owned();

    for edge in graph.get_edges() {
        let u_idx = edge.get_u();
        let node_u = graph.get_node(u_idx);
        edges_rep.push_str(&node_u.name);
        edges_rep.push_str(" ");

        let b_idx = edge.get_v();
        let node_b = graph.get_node(b_idx);
        edges_rep.push_str(&node_b.name);
        edges_rep.push_str(" ");

        let weight = edge.get_weight();
        edges_rep.push_str(&weight.to_string());
        edges_rep.push_str("\n");
    }

    edges_rep.pop();

    file.write_all(edges_rep.as_bytes())
        .expect("Unable to write data");

    Ok(())
}
