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

    pub fn remove_edge(&mut self, from: GraphNode, to: GraphNode) -> Option<edge::GraphEdge> {
        self.graph.remove_edge(from, to)
    }
}

impl MeshGraph {
    pub fn clean(&mut self) {
        let now = chrono::Utc::now().naive_utc();

        let mut nodes_to_remove = vec![];
        let mut edges_to_remove = vec![];

        for node in self.graph.nodes() {
            if now - node.last_heard
                > chrono::TimeDelta::from_std(node.timeout_duration)
                    .expect("Duration out of range of TimeDelta")
            {
                nodes_to_remove.push(node);
            }

            for (edge_from, edge_to, edge) in self.graph.edges(node) {
                if now - edge.last_heard
                    > chrono::TimeDelta::from_std(edge.timeout_duration)
                        .expect("Duration out of range of TimeDelta")
                {
                    edges_to_remove.push((edge_from, edge_to));
                }
            }
        }

        for node in nodes_to_remove {
            self.remove_node(node.node_num);
        }

        for (edge_from, edge_to) in edges_to_remove {
            self.graph.remove_edge(edge_from, edge_to);
        }
    }
}
