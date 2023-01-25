use super::distance_constants::{
    ALT_CONVERSION_FACTOR, LAT_CONVERSION_FACTOR, LON_CONVERSION_FACTOR, RADIUS_EARTH_KM,
};
use crate::aux_functions::edge_factory::edge_factory;
use crate::aux_functions::take_snapshot::total_distance;
use crate::graph::graph_ds::Graph;
use crate::mesh::device::MeshNode;
use petgraph::graph::NodeIndex;
use std::collections::HashMap;

/*
* Calculates the distance between two points on a sphere using helpers in graph snapshot
*
* Conversion function:
* Lat/Long: 1e-7 conversion from int to floating point degrees; see mesh.proto
* Altitude: in meters above sea level, no conversion needed
* Returns distance in kilometers
*/
pub fn get_distance(node_1: MeshNode, node_2: MeshNode) -> f64 {
    let node_1_data = node_1.data;
    let node_2_data = node_2.data;
    let node_1_pos = node_1_data.position.unwrap();
    let node_2_pos = node_2_data.position.unwrap();
    total_distance(
        node_1_pos.latitude_i as f64 * LAT_CONVERSION_FACTOR,
        node_1_pos.longitude_i as f64 * LON_CONVERSION_FACTOR,
        node_1_pos.altitude as f64 * ALT_CONVERSION_FACTOR,
        node_2_pos.latitude_i as f64 * LAT_CONVERSION_FACTOR,
        node_2_pos.longitude_i as f64 * LON_CONVERSION_FACTOR,
        node_2_pos.altitude as f64 * ALT_CONVERSION_FACTOR,
    )
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
    let r = RADIUS_EARTH_KM;
    let d_lat = (lat2 - lat1).to_radians();
    let d_lon = (lon2 - lon1).to_radians();
    let a = (d_lat / 2.0).sin().powi(2)
        + (d_lon / 2.0).sin().powi(2) * lat1.to_radians().cos() * lat2.to_radians().cos();
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    r * c
}

// Convert gps degrees to protobuf field
pub fn gps_degrees_to_protobuf_field(lat: f64, lon: f64) -> (i32, i32) {
    let lat_i = (lat / LAT_CONVERSION_FACTOR) as i32;
    let lon_i = (lon / LON_CONVERSION_FACTOR) as i32;
    (lat_i, lon_i)
}
