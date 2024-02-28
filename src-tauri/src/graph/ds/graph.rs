use std::collections::HashMap;

use petgraph::graphmap::GraphMap;
use serde::{Deserialize, Serialize};

use super::{
    edge,
    node::{self, GraphNode},
};

pub type InternalGraph = GraphMap<node::GraphNode, edge::GraphEdge, petgraph::Directed>;

#[derive(Clone, Serialize, Deserialize)]

pub struct MeshGraph {
    graph: InternalGraph,
    pub nodes_lookup: HashMap<u32, GraphNode>, // TODO use NodeId -- need to implement serialize and deserialize
}

impl MeshGraph {
    pub fn new() -> Self {
        Self {
            graph: GraphMap::new(),
            nodes_lookup: HashMap::new(),
        }
    }
}

impl MeshGraph {
    pub fn add_node(&mut self, node: GraphNode) -> GraphNode {
        let created_node = self.graph.add_node(node);
        self.nodes_lookup.insert(node.node_num, node);
        created_node
    }

    pub fn get_node(&self, node_num: u32) -> Option<GraphNode> {
        self.nodes_lookup.get(&node_num).cloned()
    }

    pub fn contains_node(&self, node_num: u32) -> bool {
        self.nodes_lookup.contains_key(&node_num)
    }

    pub fn update_node(&mut self, node: GraphNode) -> GraphNode {
        self.remove_node(node.node_num);
        self.add_node(node)
    }

    pub fn remove_node(&mut self, node_num: u32) -> Option<GraphNode> {
        let helper_node = GraphNode {
            node_num,
            last_heard: chrono::Utc::now().naive_utc(),
            timeout_duration: std::time::Duration::from_secs(30),
        };

        self.graph.remove_node(helper_node);
        self.nodes_lookup.remove(&node_num)
    }
}

impl MeshGraph {
    pub fn add_edge(
        &mut self,
        source: GraphNode,
        target: GraphNode,
        edge: edge::GraphEdge,
    ) -> Option<edge::GraphEdge> {
        self.graph.add_edge(source, target, edge)
    }
}
