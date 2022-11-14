use serde::{Deserialize, Serialize};
/*
* This is the info we're given for each node, which records (in
* protobuf structs) its user and position info and user/position info for each neighbor.
*
* We'll recieve N of these and use them to create a graph with N nodes.
*/

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Neighbor {
    pub id: u32,
    pub snr: f64,
    pub lat: f64,
    pub lon: f64,
    pub alt: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NeighborInfo {
    pub selfnode: Neighbor,
    pub neighbors: Vec<Neighbor>,
}
