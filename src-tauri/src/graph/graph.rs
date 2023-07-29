// use log::trace;
// use petgraph::stable_graph::{EdgeIndex, NodeIndex, StableUnGraph};

// #[derive(Clone, Debug, Default)]
// pub struct GraphNodeData;

// #[derive(Clone, Debug, Default)]
// pub struct GraphEdgeData;

// #[derive(Debug, Default)]
// pub struct Graph {
//     pub g: StableUnGraph<GraphNodeData, GraphEdgeData>,
//     node_expirations: tokio_util::time::DelayQueue<NodeIndex>,
//     edge_expirations: tokio_util::time::DelayQueue<EdgeIndex>,
// }

// impl Graph {
//     pub fn new() -> Graph {
//         Graph {
//             g: StableUnGraph::default(),
//             node_expirations: tokio_util::time::DelayQueue::new(),
//             edge_expirations: tokio_util::time::DelayQueue::new(),
//         }
//     }

//     pub fn insert_node(&mut self, node: GraphNodeData, timeout: std::time::Duration) -> NodeIndex {
//         trace!("Inserting node: {:?}, timeout: {:?}", node, timeout);

//         let index = self.g.add_node(node);
//         self.node_expirations.insert(index, timeout);
//         index
//     }

//     // Note that this method will panic if either u or v don't exist, but
//     // this should not be a problem if developers don't hardcode NodeIndex identifiers
//     // and don't use a NodeIndex after it has been removed from the graph
//     pub fn insert_edge(
//         &mut self,
//         u: &NodeIndex,
//         v: &NodeIndex,
//         edge: GraphEdgeData,
//         timeout: std::time::Duration,
//     ) -> EdgeIndex {
//         trace!(
//             "Inserting edge: u: {:?}, v: {:?}, edge: {:?}, timeout: {:?}",
//             u,
//             v,
//             edge,
//             timeout
//         );

//         // let index = self.g.add_edge(u, v, edge);
//         self.edge_expirations.insert(index, timeout);
//         index
//     }

//     /// Removes a node from the graph, along with all edges connected to it.
//     ///
//     /// # Panics
//     ///
//     /// This method will panic if the node does not exist in the graph at the provided index.
//     ///
//     /// # Examples
//     ///
//     /// ```
//     /// use std::time::Duration;
//     ///
//     /// let g = Graph::new();
//     /// let node_index = g.insert_node(GraphNodeData::default(), Duration::from_secs(10));
//     /// g.remove_node(node_index);
//     /// ```
//     pub fn remove_node(&mut self, index: NodeIndex) {
//         trace!("Removing node: {:?}", index);

//         // self.g.no
//         self.g.remove_node(index);
//     }
// }
