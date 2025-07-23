use std::collections::HashMap;

use petgraph::graphmap::GraphMap;
use serde::{Deserialize, Serialize};
use tauri::async_runtime::JoinHandle;

use super::{
    edge,
    node::{self, GraphNode},
};

pub type InternalGraph = GraphMap<node::GraphNode, edge::GraphEdge, petgraph::Directed>;

#[derive(Serialize, Deserialize)]

pub struct MeshGraph {
    graph: InternalGraph,
    pub nodes_lookup: HashMap<u32, GraphNode>, // TODO use NodeId -- need to implement serialize and deserialize
    #[serde(skip)]
    pub timeout_handle: Option<JoinHandle<()>>,
}

impl Clone for MeshGraph {
    fn clone(&self) -> Self {
        Self {
            graph: self.graph.clone(),
            nodes_lookup: self.nodes_lookup.clone(),
            timeout_handle: None,
        }
    }
}

impl MeshGraph {
    pub fn new() -> Self {
        Self {
            graph: GraphMap::new(),
            nodes_lookup: HashMap::new(),
            timeout_handle: None,
        }
    }
}

impl MeshGraph {
    fn add_node(&mut self, node: GraphNode) -> GraphNode {
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

    pub fn upsert_node(&mut self, node: GraphNode) -> GraphNode {
        if self.contains_node(node.node_num) {
            self.remove_node(node.node_num);
        }

        self.add_node(node)
    }

    pub fn remove_node(&mut self, node_num: u32) -> Option<GraphNode> {
        let graph_node = self.get_node(node_num)?;

        if self.graph.remove_node(graph_node) == false {
            log::error!("Node with num {} not removed from graph", node_num);
            return None;
        }

        self.nodes_lookup.remove(&node_num)
    }
}

impl MeshGraph {
    pub fn upsert_edge(
        &mut self,
        source: GraphNode,
        target: GraphNode,
        edge: edge::GraphEdge,
    ) -> Option<edge::GraphEdge> {
        if self.graph.contains_edge(source, target) {
            self.remove_edge(source, target); // Remove the edge if it exists
        }

        self.graph.add_edge(source, target, edge)
    }

    pub fn remove_edge(&mut self, from: GraphNode, to: GraphNode) -> Option<edge::GraphEdge> {
        self.graph.remove_edge(from, to)
    }
}

impl MeshGraph {
    pub fn clean(&mut self) {
        let now = chrono::Utc::now();

        // Edges will be removed if either the source or target node is removed
        let mut nodes_to_remove = vec![];

        for node in self.nodes_lookup.values() {
            if now - node.last_heard
                > chrono::TimeDelta::from_std(node.timeout_duration)
                    .expect("Duration out of range of TimeDelta")
            {
                log::trace!("Node {} has timed out", node.node_num);
                nodes_to_remove.push(node.node_num);
            } else {
                log::trace!("Node {} has not timed out", node.node_num);
            }
        }

        for node_num in nodes_to_remove {
            self.remove_node(node_num);
            log::debug!("Node {} removed from graph", node_num);
        }
    }
}
