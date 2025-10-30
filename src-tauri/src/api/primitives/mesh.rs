use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Waypoint {
    /// The waypoint's unique identifier
    pub id: u32,

    /// Latitude of the waypoint
    pub latitude: f32,

    /// Longitude of the waypoint
    pub longitude: f32,

    /// Expire time of waypoint in seconds since epoch
    pub expire: u32,

    /// Id of the node the waypoint is locked to.
    /// Waypoint can be edited by any node if this is 0
    pub locked_to: u32,

    /// Name of the waypoint (max 30 chars)
    pub name: String,

    /// Description of the waypoint (max 100 chars)
    pub description: String,

    /// Icon for the waypoint in the form of a unicode emoji
    pub icon: u32,
}
