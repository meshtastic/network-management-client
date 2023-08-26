use super::{MeshDevice, NormalizedWaypoint};

pub mod handlers;
pub mod helpers;
pub mod stream_api;
pub mod stream_buffer;

#[derive(Clone, Copy, Debug, Default)]
pub enum PacketDestination {
    Local,
    #[default]
    Broadcast,
    Node(u32),
}
