use app::protobufs::{Position, User};

/*
* This is the info we're given for each node, which records (in
* protobuf structs) its user and position info and user/position info for each neighbor.
*
* We'll recieve N of these and use them to create a graph with N nodes.
*/
pub struct NeighborInfo {
    pub(crate) user: User,
    pub(crate) position: Position,
    pub(crate) num_neighbors: u32,
    pub(crate) neighbors: Vec<Neighbor>,
}

pub struct Neighbor {
    pub(crate) user: User,
    pub(crate) position: Position,
}

/*
* This is the datatype of our return data for frontend overlays.
*/
pub struct Point {
    x: i32,
    y: i32,
}
