use std::collections::{HashMap, HashSet};

#[derive(Debug)]
pub struct Node {
    pub name: String,
    //pub neighbors: Vec<Node>,
    pub optimal_weighted_degree: f64,
}

impl Node {
    pub fn new(name: String) -> Node {
        Node {
            name,
            //neighbors: Vec::new(),
            optimal_weighted_degree: 0.0,
        }
    }
}

// Add clone trait to Node
impl Clone for Node {
    fn clone(&self) -> Self {
        Node {
            name: self.name.clone(),
            //neighbors: self.neighbors.clone(),
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
    pub u: Node,
    pub v: Node,
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
    pub fn new(u: Node, v: Node, weight: f64) -> Edge {
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
    pub edges: HashSet<Edge>,
    pub nodes: HashSet<Node>,
    pub neighbors: HashMap<String, HashSet<Node>>,
    pub order: usize,
    pub size: usize,
    pub total_weight: usize,
    pub cumulative_edge_weights: Vec<usize>,
    pub optimal_weighted_degrees: HashMap<Node, usize>,
    pub cumulative_optimal_weighted_degrees: Vec<usize>,
    pub weights: HashMap<(String, String), usize>,
}

impl Graph {
    pub fn new() -> Graph {
        Graph {
            edges: HashSet::new(),
            nodes: HashSet::new(),
            neighbors: HashMap::new(),
            order: 0,
            size: 0,
            total_weight: 0,
            cumulative_edge_weights: Vec::new(),
            optimal_weighted_degrees: HashMap::new(),
            cumulative_optimal_weighted_degrees: Vec::new(),
            weights: HashMap::new(),
        }
    }

    pub fn add_edge(&mut self, u: &Node, v: &Node, w: usize) {
        // Check if the edge already exists
        if self
            .edges
            .contains(&Edge::new(u.clone(), v.clone(), w as f64))
        {
            return;
        }
        self.size += 1;
        self.edges.insert(Edge {
            u: u.clone(),
            v: v.clone(),
            weight: w as f64,
        });

        let u_name = u.name.clone();
        let v_name = v.name.clone();

        // Insert (u_name, v_name) and w into weights
        self.weights.insert((u_name, v_name), w);

        self.total_weight += w;

        let u_name = u.name.clone();
        let v_name = v.name.clone();

        self.neighbors
            .entry(u_name)
            .or_insert(HashSet::new())
            .insert(v.clone());
        self.neighbors
            .entry(v_name)
            .or_insert(HashSet::new())
            .insert(u.clone());
    }

    pub fn remove_edge(&mut self, e: Edge) {
        self.edges.remove(&e);
        self.size -= 1;
        self.total_weight -= self.weights[&(e.u.name.clone(), e.v.name.clone())];
        self.neighbors.get_mut(&e.u.name).unwrap().remove(&e.v);
        self.neighbors.get_mut(&e.v.name).unwrap().remove(&e.u);
    }

    pub fn add_node(&mut self, u: &Node) {
        // check if node is already in graph
        if self.nodes.contains(u) {
            return;
        }
        self.nodes.insert(u.clone());
        self.order += 1;
    }

    pub fn remove_node(&mut self, u: &Node) {
        self.nodes.remove(&u);
        self.order -= 1;
        let u_name = u.name.clone();

        for v in self.neighbors[&u_name].clone() {
            let u_name = u.name.clone();
            let v_name = v.name.clone();

            self.remove_edge(Edge {
                u: u.clone(),
                v: v.clone(),
                weight: self.weights[&(u_name, v_name)] as f64,
            });
            self.size -= 1;
        }
    }

    pub fn get_edges(&self) -> HashSet<Edge> {
        self.edges.clone()
    }

    pub fn get_nodes(&self) -> HashSet<Node> {
        self.nodes.clone()
    }

    pub fn get_order(&self) -> usize {
        self.order
    }

    pub fn get_size(&self) -> usize {
        self.size
    }

    pub fn get_cumulative_edge_weights(&self) -> Vec<usize> {
        self.cumulative_edge_weights.clone()
    }

    pub fn get_cumulative_optimal_weighted_degrees(&self) -> Vec<usize> {
        self.cumulative_optimal_weighted_degrees.clone()
    }

    pub fn get_optimal_weighted_degrees(&self) -> HashMap<Node, usize> {
        self.optimal_weighted_degrees.clone()
    }

    pub fn get_total_weight(&self) -> usize {
        self.total_weight
    }

    pub fn get_optimal_weighted_degree(&self, node: &Node) -> usize {
        self.optimal_weighted_degrees[node]
    }

    pub fn get_edge_weight(&self, e: Edge) -> usize {
        let u_name = e.u.name.clone();
        let v_name = e.v.name.clone();
        self.weights[&(u_name, v_name)]
    }

    pub fn get_subset_weight_sum(&self, subset: HashSet<Node>) -> usize {
        let mut sum = 0;

        // Loop through nodes in set difference of self.nodes and subset
        for u in self.nodes.difference(&subset) {
            for v in self.nodes.difference(&subset) {
                let u_name = u.name.clone();
                let v_name = v.name.clone();
                sum += self.weights[&(u_name, v_name)];
            }
        }
        return sum;
    }

    pub fn copy(&self) -> Graph {
        let mut G = Graph::new();
        G.edges = self.edges.clone();
        G.nodes = self.nodes.clone();
        G.neighbors = self.neighbors.clone();
        G.order = self.order;
        G.total_weight = self.total_weight;
        G.cumulative_edge_weights = self.cumulative_edge_weights.clone();
        G.optimal_weighted_degrees = self.optimal_weighted_degrees.clone();
        G.cumulative_optimal_weighted_degrees = self.cumulative_optimal_weighted_degrees.clone();
        G.weights = self.weights.clone();
        return G;
    }

    pub fn set_optimal_weighted_degree(&mut self, node: Node, val: usize) {
        self.optimal_weighted_degrees.insert(node, val);
    }

    pub fn set_edge_weight(&mut self, e: Edge, w: usize) {
        let u_name = e.u.name.clone();
        let v_name = e.v.name.clone();
        let old_weight = self.weights[&(u_name, v_name)];

        self.total_weight -= old_weight;
        let u_name = e.u.name.clone();
        let v_name = e.v.name.clone();
        self.weights.insert((u_name, v_name), w);

        self.total_weight += w;
    }

    pub fn update_cumulative_edge_weights(&mut self) {
        let mut cumulative_edge_weights = Vec::new();
        let mut cumulative_weight = 0;
        for e in self.edges.clone() {
            let u_name = e.u.name.clone();
            let v_name = e.v.name.clone();
            cumulative_weight += self.weights[&(u_name, v_name)];
            cumulative_edge_weights.push(cumulative_weight);
        }
        self.cumulative_edge_weights = cumulative_edge_weights;
    }
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
        let u: Node = Node::new("u".to_string());
        let v: Node = Node::new("v".to_string());
        // let w: Node = Node::new("w".to_string());
        // let x: Node = Node::new("x".to_string());
        // let y: Node = Node::new("y".to_string());
        // let z: Node = Node::new("z".to_string());

        G.add_node(&u.clone());
        G.add_node(&v.clone());
        assert_eq!(G.get_order(), 2);
        println!("Nodes: {:?}", G.get_nodes());

        G.add_edge(&u.clone(), &v.clone(), 1);
        G.add_edge(&u.clone(), &v.clone(), 1);
        assert_eq!(G.get_size(), 1);
        // Print the edges and nodes in the graph
        println!("Edges: {:?}", G.get_edges());

        // G.add_node(w.clone());
        // G.add_node(x.clone());
        // G.add_node(y.clone());
        // G.add_node(z.clone());

        /*
        G.add_edge(u.clone(), v.clone(), 1);
        G.add_edge(u.clone(), w.clone(), 1);
        G.add_edge(u.clone(), x.clone(), 1);
        G.add_edge(u.clone(), y.clone(), 1);
        G.add_edge(u.clone(), z.clone(), 1);
        G.add_edge(v.clone(), w.clone(), 1);
        G.add_edge(v.clone(), x.clone(), 1);
        G.add_edge(v.clone(), y.clone(), 1);
        G.add_edge(v.clone(), z.clone(), 1);
        G.add_edge(w.clone(), x.clone(), 1);
        G.add_edge(w.clone(), y.clone(), 1);
        G.add_edge(w.clone(), z.clone(), 1);
        G.add_edge(x.clone(), y.clone(), 1);
        G.add_edge(x.clone(), z.clone(), 1);
        G.add_edge(y.clone(), z.clone(), 1);
        */

        // Check that the graph has the correct number of nodes and edges

        //assert_eq!(G.get_edges().len(), 15);
        //assert_eq!(G.get_nodes().len(), 6);

        // Check that the graph has the correct neighbors for each node
        /*
        assert_eq!(G.get_neighbors(u.clone()).len(), 5);
        assert_eq!(G.get_neighbors(v.clone()).len(), 5);
        assert_eq!(G.get_neighbors(w.clone()).len(), 5);
        assert_eq!(G.get_neighbors(x.clone()).len(), 5);
        assert_eq!(G.get_neighbors(y.clone()).len(), 5);
        assert_eq!(G.get_neighbors(z.clone()).len(), 5);
        */
    }
}
