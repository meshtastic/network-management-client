use serde::{Deserialize, Serialize};
/*
* When we try to reconstruct graph topology, we need to know the neighbors of each node.
* To do that, each node maintains a record of past messages and senders (neighbors).
* This list is assembled in a NeighborInfo struct (or packet), and sent to the coordinator.
*/

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Neighbor {
    // ID of sender
    pub id: u32,
    // SNR (signal to noise ratio) of recieved message
    pub snr: f64,
    // Time message was recieved from the sender (neighbor)
    pub timestamp: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NeighborInfo {
    // ID of node (sender)
    pub id: u32,
    // Time NeighborInfo packet is sent to update coordinator
    pub timestamp: u64,
    // List of neighbors of the node and the SNR of their edges
    pub neighbors: Vec<Neighbor>,
}
