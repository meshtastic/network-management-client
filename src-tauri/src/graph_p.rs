use petgraph::prelude::*;
use std::collections::HashMap;

#[derive(Debug)]
pub struct Node {
    pub name: String,
    pub optimal_weighted_degree: f64,
}

impl Node {
    pub fn new(name: String) -> Node {
        Node {
            name,
            optimal_weighted_degree: 0.0,
        }
    }
}

// Add clone trait to Node
impl Clone for Node {
    fn clone(&self) -> Self {
        Node {
            name: self.name.clone(),
            optimal_weighted_degree: self.optimal_weighted_degree,
        }
    }
}

// Add hash to Node so that we can use it as a key in a HashMap
impl std::hash::Hash for Node {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.name.hash(state);
    }
}

// Add equality operator to Node
impl std::cmp::Eq for Node {}

// Add partial equality operator to Node
impl std::cmp::PartialEq for Node {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
    }
}

#[derive(Debug)]
pub struct Edge {
    pub u: petgraph::graph::NodeIndex,
    pub v: petgraph::graph::NodeIndex,
    pub weight: f64,
}

// Add hash operator to Edge
impl std::hash::Hash for Edge {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.u.hash(state);
        self.v.hash(state);
    }
}

impl Edge {
    pub fn new(u: petgraph::graph::NodeIndex, v: petgraph::graph::NodeIndex, weight: f64) -> Edge {
        Edge { u, v, weight }
    }
}

// Add clone trait to Edge
impl Clone for Edge {
    fn clone(&self) -> Self {
        Edge {
            u: self.u.clone(),
            v: self.v.clone(),
            weight: self.weight,
        }
    }
}

// Add eq operator to Edge
impl std::cmp::Eq for Edge {}

// Add equality operator to Edge
impl PartialEq for Edge {
    fn eq(&self, other: &Self) -> bool {
        self.u == other.u && self.v == other.v
    }
}

pub struct Graph {
    pub g: StableGraph<Node, Edge>,
    pub node_idx_map: HashMap<String, petgraph::graph::NodeIndex>,
    pub edge_idx_map: HashMap<
        (petgraph::graph::NodeIndex, petgraph::graph::NodeIndex),
        petgraph::graph::EdgeIndex,
    >,
}

impl Graph {
    pub fn new() -> Graph {
        Graph {
            g: StableGraph::new(),
            node_idx_map: HashMap::new(),
            edge_idx_map: HashMap::new(),
        }
    }

    pub fn add_node(&mut self, name: String) {
        let node = Node::new(name.clone());
        let node_idx = self.g.add_node(node.clone());
        self.node_idx_map.insert(node.name.clone(), node_idx);
    }

    pub fn change_node_opt_weight(&mut self, idx: petgraph::graph::NodeIndex, weight: f64) {
        let mut node = self.g.node_weight_mut(idx).unwrap();
        node.optimal_weighted_degree += weight;
    }

    pub fn add_edge(&mut self, u: String, v: String, weight: f64) {
        if !self.node_idx_map.contains_key(&u) {
            let error_message = format!("Node {} does not exist", u);
            return print_error_and_return(&error_message);
        }
        if !self.node_idx_map.contains_key(&v) {
            let error_message = format!("Node {} does not exist", v);
            return print_error_and_return(&error_message);
        }

        let u_idx = self.node_idx_map.get(&u).unwrap();
        let v_idx = self.node_idx_map.get(&v).unwrap();

        // Check if edge already exists
        if self.g.contains_edge(u_idx.clone(), v_idx.clone()) {
            let error_message = format!("Edge ({}, {}) already exists", u.clone(), v.clone());
            return print_error_and_return(&error_message);
        }

        let edge_1 = Edge::new(u_idx.clone(), v_idx.clone(), weight);
        let edge_2 = Edge::new(v_idx.clone(), u_idx.clone(), weight);

        let edge_idx_1 = self.g.add_edge(u_idx.clone(), v_idx.clone(), edge_1);
        let edge_idx_2 = self.g.add_edge(v_idx.clone(), u_idx.clone(), edge_2);

        let u_idx_clone = u_idx.clone();
        let v_idx_clone = v_idx.clone();

        self.edge_idx_map
            .insert((u_idx.clone(), v_idx.clone()), edge_idx_1.clone());
        self.edge_idx_map
            .insert((v_idx.clone(), u_idx.clone()), edge_idx_2.clone());

        self.change_node_opt_weight(u_idx_clone, weight);
        self.change_node_opt_weight(v_idx_clone, weight);
    }

    pub fn update_edge(&mut self, u: String, v: String, weight: f64) {
        if !self.node_idx_map.contains_key(&u) {
            let error_message = format!("Node {} does not exist", u);
            return print_error_and_return(&error_message);
        }
        if !self.node_idx_map.contains_key(&v) {
            let error_message = format!("Node {} does not exist", v);
            return print_error_and_return(&error_message);
        }

        let u_idx = self.node_idx_map.get(&u).unwrap();
        let v_idx = self.node_idx_map.get(&v).unwrap();

        println!("u_idx: {:?}, v_idx: {:?}", u_idx, v_idx);
        // Check if edge does not exist
        if !self.g.contains_edge(u_idx.clone(), v_idx.clone()) {
            let error_message = format!("Edge: ({}, {}) does not exist", u, v);
            return print_error_and_return(&error_message);
        }

        let edge_idx = self
            .edge_idx_map
            .get(&(u_idx.clone(), v_idx.clone()))
            .unwrap();
        let old_weight = self.g.edge_weight(edge_idx.clone()).unwrap().weight;

        let edge_1 = Edge::new(u_idx.clone(), v_idx.clone(), weight);
        let edge_2 = Edge::new(v_idx.clone(), u_idx.clone(), weight);

        let edge_idx_1 = self.g.update_edge(u_idx.clone(), v_idx.clone(), edge_1);
        let edge_idx_2 = self.g.update_edge(v_idx.clone(), u_idx.clone(), edge_2);

        let u_idx_clone = u_idx.clone();
        let v_idx_clone = v_idx.clone();

        // Update edge_idx_map to reflect the new edge index
        self.edge_idx_map
            .entry((u_idx.clone(), v_idx.clone()))
            .and_modify(|e| *e = edge_idx_1)
            .or_insert(edge_idx_1);

        self.edge_idx_map
            .entry((v_idx.clone(), u_idx.clone()))
            .and_modify(|e| *e = edge_idx_2)
            .or_insert(edge_idx_2);

        self.change_node_opt_weight(u_idx_clone, weight - old_weight);
        self.change_node_opt_weight(v_idx_clone, weight - old_weight);
    }

    pub fn get_edge_weight(&self, u: String, v: String) -> f64 {
        if !self.node_idx_map.contains_key(&u) {
            let error_message = format!("Node {} does not exist", u);
            println!("{}", error_message);
            return 0.0;
        }
        if !self.node_idx_map.contains_key(&v) {
            let error_message = format!("Node {} does not exist", v);
            println!("{}", error_message);
            return 0.0;
        }

        let u_idx = self.node_idx_map.get(&u).unwrap();
        let v_idx = self.node_idx_map.get(&v).unwrap();

        // Check if edge does not exist
        if !self.g.contains_edge(u_idx.clone(), v_idx.clone()) {
            println!("Edge does not exist");
            return 0.0;
        }

        let edge_idx = self
            .edge_idx_map
            .get(&(u_idx.clone(), v_idx.clone()))
            .unwrap();
        let weight = self.g.edge_weight(edge_idx.clone()).unwrap().weight;

        weight
    }

    pub fn remove_edge(&mut self, u: String, v: String) {
        if !self.node_idx_map.contains_key(&u) {
            let error_message = format!("Node {} does not exist", u);
            return print_error_and_return(&error_message);
        }
        if !self.node_idx_map.contains_key(&v) {
            let error_message = format!("Node {} does not exist", v);
            return print_error_and_return(&error_message);
        }

        let u_idx = self.node_idx_map.get(&u).unwrap();
        let v_idx = self.node_idx_map.get(&v).unwrap();

        // Check if edge does not exist
        if !self.g.contains_edge(u_idx.clone(), v_idx.clone()) {
            println!("Edge: ({}, {}) does not exist", u, v);
            return print_error_and_return("Edge does not exist");
        }

        let edge_idx_1 = self
            .edge_idx_map
            .get(&(u_idx.clone(), v_idx.clone()))
            .unwrap();

        let edge_idx_2 = self
            .edge_idx_map
            .get(&(v_idx.clone(), u_idx.clone()))
            .unwrap();

        let weight = self.g.edge_weight(edge_idx_1.clone()).unwrap().weight;

        self.g.remove_edge(edge_idx_1.clone());
        self.g.remove_edge(edge_idx_2.clone());

        let u_idx_clone = u_idx.clone();
        let v_idx_clone = v_idx.clone();

        self.edge_idx_map.remove(&(u_idx.clone(), v_idx.clone()));
        self.edge_idx_map.remove(&(v_idx.clone(), u_idx.clone()));

        self.change_node_opt_weight(u_idx_clone, -weight);
        self.change_node_opt_weight(v_idx_clone, -weight);
    }

    pub fn get_order(&self) -> usize {
        self.g.node_count()
    }

    pub fn get_size(&self) -> usize {
        self.g.edge_count()
    }

    pub fn clone(&self) -> Graph {
        Graph {
            g: self.g.clone(),
            node_idx_map: self.node_idx_map.clone(),
            edge_idx_map: self.edge_idx_map.clone(),
        }
    }

    // Currently immutable
    pub fn get_nodes(&self) -> Vec<Node> {
        let mut nodes = Vec::new();
        for node in self.g.node_weights() {
            nodes.push(node.clone());
        }
        nodes
    }

    // Get node given idx
    pub fn get_node(&self, idx: petgraph::graph::NodeIndex) -> Node {
        self.g.node_weight(idx).unwrap().clone()
    }

    // Currently immutable
    pub fn get_edges(&self) -> Vec<Edge> {
        let mut edges = Vec::new();
        for edge in self.g.edge_weights() {
            edges.push(edge.clone());
        }
        edges
    }

    pub fn degree_of(&self, node: String) -> usize {
        if !self.node_idx_map.contains_key(&node) {
            let error_message = format!("Node {} does not exist", node);
            println!("{}", error_message);
            return 0;
        }

        let node_idx = self.node_idx_map.get(&node).unwrap();
        self.g.neighbors(node_idx.clone()).count()
    }

    pub fn get_cumulative_edge_weights(&self) -> Vec<f64> {
        let mut cumulative_edge_weights = Vec::new();
        let mut total_weight = 0.0;
        for edge in self.g.edge_weights() {
            total_weight += edge.weight;
            cumulative_edge_weights.push(total_weight);
        }
        cumulative_edge_weights
    }
}

// Function to print given error and return
fn print_error_and_return(error: &str) {
    println!("{}", error);
    return;
}

// Create a unit test for the Graph struct
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn initialize_graph() {
        // Create a graph
        let mut G = Graph::new();

        // Create a few nodes and edges and add to graph
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();

        G.add_node(u.clone());
        G.add_node(v.clone());
        G.add_node(w.clone());

        assert_eq!(G.get_order(), 3);

        G.add_edge(u.clone(), v.clone(), 1 as f64);
        // This should return an error "Edge already exists"
        G.add_edge(u.clone(), v.clone(), 2 as f64);
        G.add_edge(u.clone(), w.clone(), 1 as f64);
        G.add_edge(v.clone(), w.clone(), 35 as f64);
        // Since this is an undirected graph, each edge is added twice
        assert_eq!(G.get_size(), 6);

        for edge in G.get_edges() {
            let node_u = G.g.node_weight(edge.u.clone()).unwrap();
            let node_v = G.g.node_weight(edge.v.clone()).unwrap();
            println!(
                "Edge: (Name: {} - Degree Weight: {}) <-> (Name: {} - Degree Weight: {}) with weight {}",
                node_u.name, node_u.optimal_weighted_degree, node_v.name, node_v.optimal_weighted_degree, edge.weight
            );
        }
        println!("\n");

        G.update_edge(u.clone(), v.clone(), 11 as f64);

        G.remove_edge(u.clone(), w.clone());
        assert_eq!(G.get_size(), 4);
        for edge in G.get_edges() {
            let node_u = G.g.node_weight(edge.u.clone()).unwrap();
            let node_v = G.g.node_weight(edge.v.clone()).unwrap();
            println!(
                "Edge: (Name: {} - Degree Weight: {}) <-> (Name: {} - Degree Weight: {}) with weight {}",
                node_u.name, node_u.optimal_weighted_degree, node_v.name, node_v.optimal_weighted_degree, edge.weight
            );
        }
        println!("\n");

        // Print the edges and nodes in the graph
        println!("Edges: {:?}", G.get_edges());

        let cum_sum = G.get_cumulative_edge_weights();
        println!("Cumulative edge weights: {:?}", cum_sum);

        println!("Degree of {}: {}", u, G.degree_of(u.clone()));
    }
}
