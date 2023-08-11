#![allow(non_snake_case)]

use app::protobufs;
use log::{error, trace, warn};
use petgraph::stable_graph::{EdgeIndex, NodeIndex};
use priority_queue::PriorityQueue;
use std::cmp::Ordering;
use std::time::{Duration, Instant};

use super::{NeighborInfoPacket, NormalizedPosition, PositionPacket};
use crate::graph::edge::GraphEdge;
use crate::graph::graph_ds::Graph;
use crate::graph::node::GraphNode;

/// Will only time nodes and edges out when they have
/// been in the priority queue for longer than
/// `node.broadcast_interval * TIMEOUT_TOLERANCE_FACTOR`
const TIMEOUT_TOLERANCE_FACTOR: f64 = 1.2;

#[derive(Clone, Debug)]
struct NodeTimeoutData {
    timeout: Instant,
}

impl Eq for NodeTimeoutData {}

impl PartialEq for NodeTimeoutData {
    fn eq(&self, other: &Self) -> bool {
        self.timeout == other.timeout
    }
}

impl Ord for NodeTimeoutData {
    fn cmp(&self, other: &Self) -> Ordering {
        self.timeout.cmp(&other.timeout)
    }
}

impl PartialOrd for NodeTimeoutData {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[derive(Clone, Debug)]
struct EdgeTimeoutData {
    timeout: Instant,
}

impl Eq for EdgeTimeoutData {}

impl PartialEq for EdgeTimeoutData {
    fn eq(&self, other: &Self) -> bool {
        self.timeout == other.timeout
    }
}

impl Ord for EdgeTimeoutData {
    fn cmp(&self, other: &Self) -> Ordering {
        self.timeout.cmp(&other.timeout)
    }
}

impl PartialOrd for EdgeTimeoutData {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// A helper function to multiply a duration by a float
fn duration_float_multiply(duration: Duration, factor: f64) -> Duration {
    let duration_secs = duration.as_secs() as f64 + f64::from(duration.subsec_nanos()) * 1e-9;
    let result_secs = duration_secs * factor;

    Duration::new(
        result_secs as u64,
        ((result_secs - result_secs.floor()) * 1e9) as u32,
    )
}

/*
 * Just as the MeshDevice struct contains all the information about a device (in raw packet form)
 * the MeshGraph struct contains the network info in raw graph form. This is synchronized with
 * the MeshDevice struct, and is used to generate the graph visualization/algorithm
 * results (see analytics).
 */

#[derive(Debug)]
pub struct MeshGraph {
    // TODO this shouldn't be public
    pub graph: Graph,
    node_timeout_queue: PriorityQueue<NodeIndex, NodeTimeoutData>,
    edge_timeout_queue: PriorityQueue<EdgeIndex, EdgeTimeoutData>,
}

impl MeshGraph {
    pub fn new() -> Self {
        MeshGraph {
            graph: Graph::new(),
            node_timeout_queue: PriorityQueue::new(),
            edge_timeout_queue: PriorityQueue::new(),
        }
    }

    pub fn update_from_neighbor_info(&mut self, packet: NeighborInfoPacket) {
        let NeighborInfoPacket { data, .. } = packet;
        let protobufs::NeighborInfo {
            neighbors,
            node_broadcast_interval_secs,
            ..
        } = data.clone();

        // Convert the NeighborInfo data into a GraphNode
        let node_index = self.add_node(data.into());

        for neighbor in neighbors {
            // Implicitly convert the Neighbor data into a GraphNode
            // TODO this should be used once the firmware doesn't zero the internal value
            // let neighbor_index = self.add_node(neighbor.into());
            let neighbor_index = self.add_node(GraphNode::new(
                neighbor.node_id,
                Duration::from_secs(node_broadcast_interval_secs.into()),
            ));

            let edge = GraphEdge::new(node_index, neighbor_index, 0.0);
            let _edge_index = self.add_edge(node_index, neighbor_index, edge);
        }
    }

    // Do nothing if the remote node hasn't sent a neighbor information packet
    // Contract says we will only track nodes that send neighbor info packets
    // Timeout only updated on a neighbor information packet
    pub fn update_from_position(&mut self, packet: PositionPacket) -> Result<(), String> {
        let node_id = packet.packet.from;

        let NormalizedPosition {
            latitude,
            longitude,
            altitude,
            ground_speed,
            ground_track,
            ..
        } = packet.data;

        let node_index = self.graph.get_node_idx(&node_id).ok_or(format!(
            "Node key {:?} not found in any nodes in graph key lookup",
            node_id
        ))?;

        let node = self
            .graph
            .get_node_mut(*node_index)
            .ok_or(format!("Node id {:?} not found in graph", node_id))?;

        node.latitude = latitude.into();
        node.longitude = longitude.into();
        node.altitude = altitude.into();
        node.speed = ground_speed.into();
        node.direction = ground_track.into();

        Ok(())
    }

    pub fn purge_graph_timeout_buffers(&mut self) {
        trace!("Purging graph timeout buffers");
        self.purge_node_timeout_buffer();
        self.purge_edge_timeout_buffer();
        trace!("Purged graph timeout buffers");
    }
}

impl MeshGraph {
    /// A method that adds a new node to the graph and returns its node index.
    /// If a node with its index already exists within the graph, this method
    /// will return the node index of that node.
    ///
    /// This method also calls update_node_timeout to add the node to the timeout queue.
    fn add_node(&mut self, node: GraphNode) -> NodeIndex {
        trace!("Adding node to graph and timeout: {:?}", node);

        let node_index = self.graph.add_node(node);
        self.update_node_timeout(node_index);
        node_index
    }

    /// A function to mark a node as heard within the timeout queue
    /// and to update its timeout to the current time + the broadcast
    /// interval of the node.
    ///
    /// TODO doctests
    /// TODO this might want to be included in the add_node method for simplicity
    fn update_node_timeout(&mut self, node_index: NodeIndex) -> Result<(), String> {
        trace!("Updating node timeout for node at index {:?}", node_index);

        let node = self
            .graph
            .g
            .node_weight_mut(node_index)
            .ok_or(format!("Could not find weight of node {:?}", node_index))?;

        let new_timeout = NodeTimeoutData {
            timeout: Instant::now() + node.broadcast_interval,
        };

        trace!("New timeout for node {:?} is {:?}", node_index, new_timeout);

        // Try and update the timeout of the node in the queue
        // If `None` is returned, the node is not in the queue
        // In this case, we push the node into the queue
        if let None = self
            .node_timeout_queue
            .change_priority(&node_index, new_timeout.clone())
        {
            self.node_timeout_queue.push(node_index, new_timeout);
        }

        Ok(())
    }

    fn purge_node_timeout_buffer(&mut self) {
        let now = Instant::now();

        trace!("Instant::now(): {:?}", now);
        trace!(
            "Node timeout buffer length: {}",
            self.node_timeout_queue.len()
        );
        trace!("Node queue state: {:?}", self.node_timeout_queue);

        if self.node_timeout_queue.is_empty() {
            trace!("Node timeout queue is empty");
            return;
        }

        while let Some((node_index, timeout_data)) = self.node_timeout_queue.peek() {
            // All remaining nodes haven't timed out
            if timeout_data.timeout > now {
                trace!("All remaining nodes will time out in the future");
                break;
            }

            let node_index = node_index.clone();
            let elapsed_time = now.duration_since(timeout_data.timeout);

            self.node_timeout_queue.pop(); // Remove the node from the queue

            let node = match self.graph.get_node(node_index) {
                Some(node) => node,
                None => {
                    error!(
                        "Node with index {:?} not found in graph, but found in timeout queue",
                        node_index
                    );
                    break;
                }
            };

            let max_allowed_time =
                duration_float_multiply(node.broadcast_interval, TIMEOUT_TOLERANCE_FACTOR);

            if elapsed_time <= max_allowed_time {
                warn!("Node not yet timed out, this should have been caught by the queue peek");
                break;
            }

            trace!(
                "Removing node at index {:?} from graph due to timeout",
                node_index
            );
            self.graph.remove_node(node_index);
        }
    }

    fn get_edge_timeout(source_node: &GraphNode, target_node: &GraphNode) -> Duration {
        // Set the edge to expire after the minimum timeout
        // of the two nodes, as the node with the smaller timeout
        // should reaffirm the edge if it still exists
        std::cmp::min(
            source_node.broadcast_interval,
            target_node.broadcast_interval,
        )
    }

    fn add_edge(
        &mut self,
        source: NodeIndex,
        target: NodeIndex,
        edge: GraphEdge,
    ) -> Result<EdgeIndex, String> {
        let edge_index = self.graph.add_edge(source, target, edge)?;
        self.update_edge_timeout(source, target);
        Ok(edge_index)
    }

    /// A function to mark an edge as heard within the timeout queue
    /// and to update its timeout to the current time + the smallest
    /// broadcast interval of its two endpoint nodes.
    ///
    /// TODO doctests
    fn update_edge_timeout(&mut self, source: NodeIndex, target: NodeIndex) -> Result<(), String> {
        trace!(
            "Updating edge timeout for edge between {:?} and {:?}",
            source,
            target
        );

        let edge_index = self.graph.get_edge_index(source, target).ok_or(format!(
            "Edge between {:?} and {:?} not found in graph",
            source, target
        ))?;

        let source_node = self
            .graph
            .g
            .node_weight(source)
            .ok_or("Source node should exist")?;

        let target_node = self
            .graph
            .g
            .node_weight(target)
            .ok_or("Target node should exist")?;

        let new_timeout = EdgeTimeoutData {
            timeout: Instant::now() + Self::get_edge_timeout(source_node, target_node),
        };

        // Try and update the timeout of the edge in the queue
        // If `None` is returned, the edge is not in the queue
        // In this case, we push the edge into the queue
        if let None = self
            .edge_timeout_queue
            .change_priority(&edge_index, new_timeout.clone())
        {
            self.edge_timeout_queue.push(edge_index, new_timeout);
        }

        Ok(())
    }

    fn purge_edge_timeout_buffer(&mut self) {
        let now = Instant::now();

        trace!("Instant::now(): {:?}", now);
        trace!(
            "Edge timeout buffer length: {}",
            self.edge_timeout_queue.len()
        );
        trace!("Edge queue state: {:?}", self.edge_timeout_queue);

        if self.edge_timeout_queue.is_empty() {
            trace!("Edge timeout queue is empty");
            return;
        }

        while let Some((edge_index, timeout_data)) = self.edge_timeout_queue.peek() {
            // All remaining nodes haven't timed out
            if timeout_data.timeout > now {
                trace!("All remaining edges will time out in the future");
                break;
            }

            self.node_timeout_queue.pop(); // Remove the node from the queue

            let (source_node_index, target_node_index) =
                match self.graph.g.edge_endpoints(*edge_index) {
                    Some(endpoints) => endpoints,
                    None => {
                        warn!(
                            "Could not find endpoints of edge with index {:?}",
                            edge_index
                        );
                        break;
                    }
                };

            let source_node = match self.graph.g.node_weight(source_node_index) {
                Some(node) => node,
                None => {
                    error!(
                        "Source node with index {:?} not found in graph, but found in timeout queue",
                        source_node_index
                    );
                    break;
                }
            };

            let target_node = match self.graph.g.node_weight(target_node_index) {
                Some(node) => node,
                None => {
                    error!(
                        "Target node with index {:?} not found in graph, but found in timeout queue",
                        target_node_index
                    );
                    break;
                }
            };

            let max_allowed_time = duration_float_multiply(
                Self::get_edge_timeout(source_node, target_node),
                TIMEOUT_TOLERANCE_FACTOR,
            );

            let elapsed_time = now.duration_since(timeout_data.timeout);

            if elapsed_time <= max_allowed_time {
                warn!("Node not yet timed out, this should have been caught by the queue peek");
                break;
            }

            trace!(
                "Removing edge at index {:?} from graph due to timeout",
                edge_index
            );
            self.graph.g.remove_edge(*edge_index);
        }
    }
}
