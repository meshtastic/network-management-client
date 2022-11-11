use app::protobufs::{DeviceMetrics, Position, User};

/*
* This is the info we're given for each node, which records (in
* protobuf structs) its user and position info and user/position info for each neighbor.
*
* We'll recieve N of these and use them to create a graph with N nodes.
*/
pub struct NeighborInfo {
    pub user: User,
    pub position: Position,
    pub num_neighbors: u32,
    pub neighbors: Vec<Neighbor>,
}

impl AsRef<NeighborInfo> for NeighborInfo {
    fn as_ref(&self) -> &Self {
        // Self is Struct<'a>, the type for which we impl AsRef
        self
    }
}

pub struct Neighbor {
    pub user: User,
    pub position: Position,
}

/*
* This is the datatype of our return data for frontend overlays.
*/
pub struct Point {
    x: i32,
    y: i32,
}
