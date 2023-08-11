#![allow(dead_code)]
use crate::analytics::algorithms::diffusion_centrality::results::EigenvalsResult;
use crate::graph::edge::GraphEdge;
use crate::graph::node::GraphNode;
use crate::state::NodeKey;

use log::{error, info, warn};
use nalgebra::DMatrix;
use petgraph::prelude::*;
use petgraph::stable_graph::{EdgeIndex, NodeIndex, StableUnGraph};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fmt::Display};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Graph {
    // TODO don't expose any of these fields as public
    pub g: StableUnGraph<GraphNode, GraphEdge>,
    pub node_idx_map: HashMap<NodeKey, NodeIndex>,
    pub edge_idx_map: HashMap<(NodeIndex, NodeIndex), Vec<EdgeIndex>>,
}

impl Graph {
    /// Creates a new graph and returns it.
    pub fn new() -> Graph {
        Graph {
            g: StableUnGraph::<GraphNode, GraphEdge>::default(),
            node_idx_map: HashMap::new(),
            edge_idx_map: HashMap::new(),
        }
    }

    /// Add a node to the graph. Returns the node index.
    ///
    /// # Arguments
    ///
    /// * `num` - String identifier of the node.
    pub fn add_node(&mut self, node: GraphNode) -> NodeIndex {
        let node_num = node.num;

        if let Some(existing_index) = self.get_node_idx(&node_num) {
            return *existing_index;
        }

        let node_idx = self.g.add_node(node);
        self.node_idx_map.insert(node_num, node_idx);

        node_idx
    }

    /// Removes node from the graph (and all edges connected to it). Does not return anything.
    ///
    /// # Arguments
    ///
    /// * `node_idx` - Node index of the node to be removed.
    pub fn remove_node(&mut self, node: NodeIndex) {
        let node_u = self.g.node_weight(node).unwrap().clone();

        for neighbor_node in self.get_neighbors_idx(node_u.num.clone()) {
            let node_v = self.g.node_weight(neighbor_node).unwrap();
            self.remove_edge(node_u.num.clone(), node_v.num.clone(), None, Some(false));
        }

        self.g.remove_node(node);
    }

    /// Updates the weight of the node. Does not return anything.
    ///
    /// # Arguments
    ///
    /// * `idx` - Index of the node we want to update, represented as NodeIndex
    /// * `new_weight` - New weight of the node
    pub fn change_node_opt_weight(&mut self, idx: NodeIndex, new_weight: f64) {
        let node = self.g.node_weight_mut(idx).unwrap();
        node.optimal_weighted_degree = new_weight;
    }

    /// Returns a boolean signalling whether the graph contains a node
    ///
    /// # Arguments
    ///
    /// * `num` - Number of the node
    pub fn contains_node(&mut self, num: NodeKey) -> bool {
        self.node_idx_map.contains_key(&num)
    }

    /// Returns whether the graph contains an edge
    ///
    /// # Arguments
    ///
    /// * `node1` - Number of the first node
    /// * `node2` - Number of the second node
    pub fn contains_edge(&mut self, node1: &NodeKey, node2: &NodeKey) -> Result<bool, String> {
        let node1_idx = self
            .get_node_idx(node1)
            .ok_or(format!("Node {} does not exist", node1))?;

        let node2_idx = self
            .get_node_idx(node2)
            .ok_or(format!("Node {} does not exist", node2))?;

        Ok(self.g.contains_edge(*node1_idx, *node2_idx))
    }

    /// Returns the edge between two nodes
    ///
    /// # Arguments
    ///
    /// * `node1` - Number of the first node
    /// * `node2` - Number of the second node
    ///
    /// # Returns
    ///
    /// * `Option<Edge>` - The edge between the two nodes if it exists
    pub fn get_edge(&mut self, source: &NodeIndex, target: &NodeIndex) -> Option<&GraphEdge> {
        let edge_index = self.get_edge_index(*source, *target)?;
        self.g.edge_weight(edge_index)
    }

    pub fn get_edge_index(&mut self, source: NodeIndex, target: NodeIndex) -> Option<EdgeIndex> {
        self.g.find_edge(source, target)
    }

    /// DOES NOT ALLOW DUPLICATE EDGES
    ///
    /// # Arguments
    ///
    /// * `source` - NodeKey identifier of the first node
    /// * `target` - NodeKey identifier of the second node
    /// * `weight` - Float weight of the edge
    pub fn add_edge(
        &mut self,
        source_index: NodeIndex,
        target_index: NodeIndex,
        edge: GraphEdge,
    ) -> Result<EdgeIndex, String> {
        if let Some(existing_edge) = self.g.find_edge(source_index, target_index) {
            info!(
                "Edge ({:?}, {:?}) already exists",
                source_index, target_index
            );
            return Ok(existing_edge);
        }

        let edge_index = self.g.add_edge(source_index, target_index, edge.clone());

        // Insert new edge into edge_idx_map which maps (u, v) to a list of edge indices
        let edge_idx_list: &mut Vec<EdgeIndex> = self
            .edge_idx_map
            .entry((source_index, target_index))
            .or_default();

        edge_idx_list.push(edge_index);

        // Insert new edge into edge_idx_map which maps (v, u) to a list of edge indices
        let edge_idx_list: &mut Vec<EdgeIndex> = self
            .edge_idx_map
            .entry((target_index, source_index))
            .or_default();

        edge_idx_list.push(edge_index);

        let source_node = self.g.node_weight(source_index).ok_or(format!(
            "Could not get weight of source node {:?}",
            source_index
        ))?;

        let target_node = self.g.node_weight(target_index).ok_or(format!(
            "Could not get weight of target node {:?}",
            target_index
        ))?;

        let updated_weight_source = source_node.optimal_weighted_degree + edge.clone().get_weight();
        let updated_weight_target = target_node.optimal_weighted_degree + edge.get_weight();

        self.change_node_opt_weight(source_index, updated_weight_source);
        self.change_node_opt_weight(target_index, updated_weight_target);

        Ok(edge_index)
    }

    /// Does the same thing as add_edge but accepts edge struct as input.
    ///
    /// # Arguments
    ///
    /// * `edge` - Edge struct
    pub fn add_edge_from_struct(&mut self, edge: GraphEdge) {
        let u_idx = edge.get_source();
        let v_idx = edge.get_target();

        let node_u = self.g.node_weight(u_idx).unwrap().clone();
        let node_v = self.g.node_weight(v_idx).unwrap().clone();

        let weight = edge.get_weight();

        let edge_idx = self.g.add_edge(edge.get_source(), edge.get_target(), edge);

        // Insert new edge into edge_idx_map which maps (u, v) to a list of edge indices
        let edge_idx_list: &mut Vec<EdgeIndex> =
            self.edge_idx_map.entry((u_idx, v_idx)).or_default();

        edge_idx_list.push(edge_idx);

        // Insert new edge into edge_idx_map which maps (v, u) to a list of edge indices
        let edge_idx_list: &mut Vec<EdgeIndex> =
            self.edge_idx_map.entry((v_idx, u_idx)).or_default();

        edge_idx_list.push(edge_idx);

        let updated_weight_u = node_u.optimal_weighted_degree + weight;
        let updated_weight_v = node_v.optimal_weighted_degree + weight;

        self.change_node_opt_weight(u_idx, updated_weight_u);
        self.change_node_opt_weight(v_idx, updated_weight_v);
    }

    /// Updates the weight of the edge. Does not return anything.
    ///
    /// # Arguments
    ///
    /// * `u` - NodeKey identifier of the first node
    /// * `v` - NodeKey identifier of the second node
    /// * `weight` - Float weight of the edge
    /// * `parallel_edge_idx` - Optional usize index of the parallel edge we want to update.
    pub fn update_edge(
        &mut self,
        source_index: NodeIndex,
        target_index: NodeIndex,
        weight: f64,
        parallel_edge_idx: Option<usize>,
        update_all_parallel: Option<bool>,
    ) -> Result<(), String> {
        // Check if edge does not exist
        if !self.g.contains_edge(source_index, target_index) {
            self.add_edge(
                source_index,
                target_index,
                GraphEdge::new(source_index, target_index, weight),
            );
        }

        let edge_idx_list = self
            .edge_idx_map
            .get(&(source_index, target_index))
            .unwrap()
            .clone();

        let old_weight = self
            .g
            .edge_weight(edge_idx_list[parallel_edge_idx.unwrap_or(0)])
            .unwrap()
            .weight;

        let updated_weight_u = self
            .g
            .node_weight(source_index)
            .unwrap()
            .optimal_weighted_degree
            + weight
            - old_weight;

        let updated_weight_v = self
            .g
            .node_weight(target_index)
            .unwrap()
            .optimal_weighted_degree
            + weight
            - old_weight;

        self.change_node_opt_weight(source_index, updated_weight_u);
        self.change_node_opt_weight(target_index, updated_weight_v);

        if !update_all_parallel.unwrap_or(false) {
            let edge = GraphEdge::new(source_index, target_index, weight);

            let edge_idx = self.g.update_edge(source_index, target_index, edge);

            // Update edge_idx_map to reflect the new edge index
            let edge_idx_list: &mut Vec<EdgeIndex> = self
                .edge_idx_map
                .entry((source_index, target_index))
                .or_default();

            edge_idx_list[parallel_edge_idx.unwrap_or(0)] = edge_idx;

            // Update edge_idx_map to reflect the new edge index
            let edge_idx_list = self
                .edge_idx_map
                .entry((target_index, source_index))
                .or_default();

            edge_idx_list[parallel_edge_idx.unwrap_or(0)] = edge_idx;
        } else {
            for parallel_edge_idx_iterator in 0..edge_idx_list.len() {
                let edge = GraphEdge::new(source_index, target_index, weight);

                let edge_idx = self.g.update_edge(source_index, target_index, edge);

                // Update edge_idx_map to reflect the new edge index
                let edge_idx_list: &mut Vec<EdgeIndex> = self
                    .edge_idx_map
                    .entry((source_index, target_index))
                    .or_default();

                edge_idx_list[parallel_edge_idx_iterator] = edge_idx;

                // Update edge_idx_map to reflect the new edge index
                let edge_idx_list: &mut Vec<EdgeIndex> = self
                    .edge_idx_map
                    .entry((target_index, source_index))
                    .or_default();

                edge_idx_list[parallel_edge_idx_iterator] = edge_idx;
            }
        }

        Ok(())
    }

    /// Returns the weight of the edge between the two nodes.
    ///
    /// # Arguments
    ///
    /// * `u` - String identifier of the first node
    /// * `v` - String identifier of the second node
    /// * `parallel_edge_idx` - Optional usize index of the parallel edge we want to update.
    /// * `get_all_parallel` - Optional bool flag to get weight sum of all parallel edges.
    pub fn get_edge_weight(
        &mut self,
        u: &NodeKey,
        v: &NodeKey,
        parallel_edge_idx: Option<usize>,
        get_all_parallel: Option<bool>,
    ) -> f64 {
        if !self.node_idx_map.contains_key(u) {
            warn!(
                "{}",
                format!("Node {} does not exist, returning empty edge weight", u)
            );
            return 0.0;
        }

        if !self.node_idx_map.contains_key(v) {
            warn!(
                "{}",
                format!("Node {} does not exist, returning empty edge weight", v)
            );
            return 0.0;
        }

        let u_idx = self.node_idx_map.get(u).unwrap();
        let v_idx = self.node_idx_map.get(v).unwrap();

        if !self.g.contains_edge(*u_idx, *v_idx) {
            warn!(
                "Graph doesn't contain edge: ({}, {}), returning empty edge weight",
                u, v
            );
            return 0.0;
        }

        let edge_idx_list = self.edge_idx_map.get(&(*u_idx, *v_idx)).unwrap();

        let mut weight = 0.0;
        if get_all_parallel.unwrap_or(false) {
            weight = self
                .g
                .edge_weight(edge_idx_list.clone()[parallel_edge_idx.unwrap_or(0)])
                .unwrap()
                .weight;
        } else {
            for edge_idx in edge_idx_list {
                weight += self.g.edge_weight(*edge_idx).unwrap().weight;
            }
        }

        weight
    }

    /// Removes an edge from the graph. Does not return anything.
    ///
    /// # Arguments
    ///
    /// * `u` - String identifier of the first node
    /// * `v` - String identifier of the second node
    /// * `parallel_edge_idx` - Optional usize index of the parallel edge we want to remove.
    /// * `remove_all_parallel` - Optional bool flag to remove all parallel edges.
    pub fn remove_edge(
        &mut self,
        u: NodeKey,
        v: NodeKey,
        parallel_edge_idx: Option<usize>,
        remove_all_parallel: Option<bool>,
    ) {
        if !self.node_idx_map.contains_key(&u) {
            let error_message = format!("Node {} does not exist", u);
            return print_error_and_return(&error_message);
        }
        if !self.node_idx_map.contains_key(&v) {
            let error_message = format!("Node {} does not exist", v);
            return print_error_and_return(&error_message);
        }

        let u_idx = *self.node_idx_map.get(&u).unwrap();
        let v_idx = *self.node_idx_map.get(&v).unwrap();

        // Check if edge does not exist
        if !self.g.contains_edge(u_idx, v_idx) {
            warn!("Edge: ({}, {}) does not exist", u, v);
            return print_error_and_return("Edge does not exist");
        }

        let edge_idx_list = self.edge_idx_map.get(&(u_idx, v_idx)).unwrap().clone();

        // If remove_all_parallel is false, then remove the single edge in the list whose
        // index is parallel_edge_idx (default 0).
        if !remove_all_parallel.unwrap_or(false) {
            let weight = self
                .g
                .edge_weight(edge_idx_list[parallel_edge_idx.unwrap_or(0)])
                .unwrap_or(&GraphEdge::new(u_idx, v_idx, 0.0))
                .weight;

            let node_u = self.g.node_weight(u_idx).unwrap();
            let node_v = self.g.node_weight(v_idx).unwrap();

            let u_weight = node_u.optimal_weighted_degree - weight;
            let v_weight = node_v.optimal_weighted_degree - weight;

            self.g
                .remove_edge(edge_idx_list[parallel_edge_idx.unwrap_or(0)]);

            let edge_idx_list_mut: &mut Vec<EdgeIndex> =
                self.edge_idx_map.entry((v_idx, u_idx)).or_default();

            edge_idx_list_mut.swap_remove(parallel_edge_idx.unwrap_or(0));

            let edge_idx_list_mut: &mut Vec<EdgeIndex> =
                self.edge_idx_map.entry((u_idx, v_idx)).or_default();

            edge_idx_list_mut.swap_remove(parallel_edge_idx.unwrap_or(0));

            self.change_node_opt_weight(u_idx, u_weight);
            self.change_node_opt_weight(v_idx, v_weight);
        } else {
            let node_u = self.g.node_weight(u_idx).unwrap();
            let node_v = self.g.node_weight(v_idx).unwrap();

            let u_weight = node_u.optimal_weighted_degree;
            let v_weight = node_v.optimal_weighted_degree;

            // If remove_all_parallel is true, then remove all edges in the list.
            for edge_idx in edge_idx_list {
                let weight = self.g.edge_weight(edge_idx).unwrap().weight;

                self.g.remove_edge(edge_idx);

                self.change_node_opt_weight(u_idx, u_weight - weight);
                self.change_node_opt_weight(v_idx, v_weight - weight);
            }

            self.edge_idx_map.remove(&(u_idx, v_idx));
            self.edge_idx_map.remove(&(v_idx, u_idx));
        }
    }

    /// Converts a graph to an adjacency matrix.
    ///
    /// # Arguments
    ///
    /// * `graph` - a graph
    ///
    /// # Returns
    ///
    /// * `Vec<Vec<f64>>` - an adjacency matrix
    pub fn convert_to_adj_matrix(&self) -> (Vec<Vec<f64>>, HashMap<usize, NodeKey>, DMatrix<f64>) {
        let mut adj_matrix = Vec::new();

        let nodes = self.get_nodes();
        let edges = self.get_edges();

        let mut node_id_to_int = HashMap::<NodeKey, usize>::new();
        let mut int_to_node_id = HashMap::<usize, NodeKey>::new();

        for (idx, node) in nodes.iter().enumerate() {
            node_id_to_int.insert(node.num.clone(), idx);
            int_to_node_id.insert(idx, node.num.clone());
        }

        for _ in 0..nodes.len() {
            adj_matrix.push(vec![0.0; nodes.len()]);
        }

        for edge in edges {
            let u_num = self
                .get_node(edge.get_source())
                .expect("Index from edge should exist")
                .num;

            let v_num = self
                .get_node(edge.get_target())
                .expect("Index from edge should exist")
                .num;

            let u_id = node_id_to_int
                .get(&u_num)
                .expect("num from edge should exist");

            let v_id = node_id_to_int
                .get(&v_num)
                .expect("Number from edge should exist");

            let weight = edge.get_weight();

            adj_matrix[*u_id][*v_id] = weight;
            adj_matrix[*v_id][*u_id] = weight;
        }

        let n = self.get_order();
        let flattened_matrix = &adj_matrix
            .iter()
            .flat_map(|row| row.iter())
            .copied()
            .collect::<Vec<f64>>();

        let d_adj_matrix = DMatrix::from_row_slice(n, n, flattened_matrix);

        (adj_matrix, int_to_node_id, d_adj_matrix)
    }

    pub fn eigenvals(&self, adj_matrix: &DMatrix<f64>) -> EigenvalsResult {
        let schur = adj_matrix.clone().schur();

        // Ensure eigenvalues are real
        let eigenvalues = match schur.eigenvalues() {
            Some(vals) => vals,
            None => return EigenvalsResult::Error("Eigenvalues are not real.".to_string()),
        };

        let eigenvalues_vec = eigenvalues.data.as_vec().clone();
        EigenvalsResult::Success(eigenvalues_vec)
    }

    /// Returns the number of nodes in the graph.
    pub fn get_order(&self) -> usize {
        self.g.node_count()
    }

    /// Returns the number of edges in the graph.
    pub fn get_size(&self) -> usize {
        self.g.edge_count()
    }

    /// Returns all the nodes in the graph.
    pub fn get_nodes(&self) -> Vec<GraphNode> {
        let mut nodes = Vec::new();
        for node in self.g.node_weights() {
            nodes.push(node.clone());
        }
        nodes
    }

    /// Returns the node associated with the given node index.
    ///
    /// # Arguments
    ///
    /// * `node_idx` - NodeIndex of the node we want to get.
    pub fn get_node(&self, idx: NodeIndex) -> Option<GraphNode> {
        Some(self.g.node_weight(idx)?.clone())
    }

    /// Returns the node associated with the given node index.
    ///
    /// # Arguments
    ///
    /// * `node_idx` - NodeIndex of the node we want to get.
    pub fn get_node_mut(&mut self, idx: NodeIndex) -> Option<&mut GraphNode> {
        self.g.node_weight_mut(idx)
    }

    /// Returns the node index associated with the given node identifier.
    ///
    /// # Panics
    ///
    /// Panics if the node does not exist.
    ///
    /// # Arguments
    ///
    /// * `node_id` - String identifier of the node we want to get.
    pub fn get_node_idx(&self, node: &NodeKey) -> Option<&NodeIndex> {
        self.node_idx_map.get(node)
    }

    /// Returns a list of all the edges in the graph.
    pub fn get_edges(&self) -> Vec<GraphEdge> {
        let mut edges = Vec::new();
        for edge in self.g.edge_weights() {
            edges.push(edge.clone());
        }
        edges
    }

    /// Returns the nodes connected to the given node.
    ///
    /// # Arguments
    ///
    /// * `node` - String identifier of the node we want to get the neighbors of.
    pub fn get_neighbors(&self, node: NodeKey) -> Vec<GraphNode> {
        let node_weight = self.node_idx_map.get(&node).unwrap();
        let mut neighbors = Vec::new();
        for neighbor in self.g.neighbors_undirected(*node_weight) {
            neighbors.push(self.g.node_weight(neighbor).unwrap().clone());
        }

        neighbors
    }

    /// Returns the indices of the nodes connected to the given node.
    ///
    /// # Arguments
    ///
    /// * `node` - NodeKey identifier of the node we want to get the neighbors of.
    pub fn get_neighbors_idx(&self, node: NodeKey) -> Vec<NodeIndex> {
        let node_weight = self.node_idx_map.get(&node).unwrap();
        let mut neighbors = Vec::new();
        for neighbor in self.g.neighbors_undirected(*node_weight) {
            neighbors.push(neighbor);
        }

        neighbors
    }

    /// Returns the number of edges connected to the given node.
    ///
    /// # Arguments
    ///
    /// * `node` - NodeKey identifier of the node we want to get the degree of.
    pub fn degree_of(&self, node: NodeKey) -> f64 {
        if !self.node_idx_map.contains_key(&node) {
            let error_message = format!("Node {} does not exist", node);
            println!("{}", error_message);
            return 0.0;
        }

        let mut degree = 0.0;
        let node_idx = self.node_idx_map.get(&node).unwrap();

        for edge in self.g.edges(*node_idx) {
            degree += self.g.edge_weight(edge.id()).unwrap().weight;
        }

        degree
    }

    /// Returns a list of cumulative edge weights.
    pub fn get_cumulative_edge_weights(&self) -> Vec<f64> {
        let mut cumulative_edge_weights = Vec::new();
        let mut total_weight = 0.0;
        for edge in self.g.edge_weights() {
            total_weight += edge.weight * 2.0;
            cumulative_edge_weights.push(total_weight);
        }
        cumulative_edge_weights
    }
}

impl Display for Graph {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut s = String::new();

        for edge in self.get_edges() {
            let node_u = self
                .get_node(edge.source)
                .expect("Index from edge should exist");
            let node_v = self
                .get_node(edge.target)
                .expect("Index from edge should exist");

            s.push_str(&format!(
                "{} - {} {}\n",
                node_u.num.clone(),
                node_v.num.clone(),
                edge.weight
            ));
        }

        write!(f, "{}", s)
    }
}

// Function to print given error and return
fn print_error_and_return(error: &str) {
    error!("{}", error);
    eprintln!("{}", error);
}

// // Create a unit test for the Graph struct
// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn initialize_graph() {
//         // Create a graph
//         let mut g = super::Graph::new();

//         // Create a few nodes and edges and add to graph
//         let u: NodeKey = 1;
//         let v: NodeKey = 2;
//         let w: NodeKey = 3;

//         let _u_idx = g.add_node(u.clone());
//         let _v_idx = g.add_node(v.clone());
//         let _w_idx = g.add_node(w.clone());

//         assert_eq!(g.get_order(), 3);

//         g.add_edge(u.clone(), v.clone(), 1_f64);
//         g.add_edge(u.clone(), w.clone(), 1_f64);
//         g.add_edge(v.clone(), w.clone(), 35_f64);

//         assert_eq!(g.get_size(), 3);

//         g.update_edge(u.clone(), v, 11_f64, None, Some(false));
//         g.remove_edge(u, w, None, Some(true));

//         assert_eq!(g.get_size(), 2);
//     }

//     #[test]
//     fn test_parallel_edges() {
//         let mut g = super::Graph::new();

//         let u: NodeKey = 1;
//         let v: NodeKey = 2;

//         let _u_idx = g.add_node(u.clone());
//         let _v_idx = g.add_node(v.clone());

//         g.add_edge(u.clone(), v.clone(), 1_f64);
//         g.add_edge(u.clone(), v.clone(), 2_f64);

//         assert_eq!(g.get_size(), 2);

//         // update edge
//         g.update_edge(u, v, 11_f64, Some(0), None);
//     }

//     #[test]
//     fn test_adj_matrix() {
//         let mut g1 = super::Graph::new();

//         // Create a few nodes and edges and add to graph
//         let a: NodeKey = 1;
//         let b: NodeKey = 2;
//         let c: NodeKey = 3;
//         let d: NodeKey = 4;

//         let mut a_node = GraphNode::default();
//         a_node.num = a;
//         a_node.latitude = 43.71489;
//         a_node.longitude = -72.28486;
//         a_node.altitude = 1.0;
//         let a_idx = g1.add_node_from_struct(a_node);

//         let mut b_node = GraphNode::default();
//         b_node.num = b;
//         b_node.latitude = 43.71584;
//         b_node.longitude = -72.28239;
//         b_node.altitude = 1.0;
//         let b_idx = g1.add_node_from_struct(b_node);

//         let mut c_node = GraphNode::default();
//         c_node.num = c;
//         c_node.latitude = 43.7114;
//         c_node.longitude = -72.28332;
//         c_node.altitude = 1.0;
//         let c_idx = g1.add_node_from_struct(c_node);

//         let mut d_node = GraphNode::default();
//         d_node.num = d;
//         d_node.latitude = 43.71235;
//         d_node.longitude = -72.28085;
//         d_node.altitude = 1.0;
//         let d_idx = g1.add_node_from_struct(d_node);

//         let a_b = GraphEdge::new(a_idx, b_idx, 0.51);
//         g1.add_edge_from_struct(a_b);

//         let a_c = GraphEdge::new(a_idx, c_idx, 0.39);
//         g1.add_edge_from_struct(a_c);

//         let b_c = GraphEdge::new(b_idx, c_idx, 0.4);
//         g1.add_edge_from_struct(b_c);

//         let b_d = GraphEdge::new(b_idx, d_idx, 0.6);
//         g1.add_edge_from_struct(b_d);

//         let (adj_matrix, _int_to_node_id, _d_adj) = g1.convert_to_adj_matrix();

//         // assert that the adjacency matrix is correct
//         assert_eq!(
//             adj_matrix,
//             vec![
//                 vec![0.0, 0.51, 0.39, 0.0],
//                 vec![0.51, 0.0, 0.4, 0.6],
//                 vec![0.39, 0.4, 0.0, 0.0],
//                 vec![0.0, 0.6, 0.0, 0.0]
//             ]
//         );
//     }
// }
