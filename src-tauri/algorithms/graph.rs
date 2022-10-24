pub struct Node {
    pub name: String,
    pub neighbors: Vec<Node>,
    pub optimal_weighted_degree: f64,
}

// Add equality operator to Node
impl PartialEq for Node {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
    }
}

pub struct Edge {
    pub u: Node,
    pub v: Node,
    pub weight: f64,
}

// Add equality operator to Edge
impl PartialEq for Edge {
    fn eq(&self, other: &Self) -> bool {
        self.u == other.u && self.v == other.v
    }
}

pub struct Graph {
    pub edges: HashSet<Edge>,
    pub nodes: HashSet<Node>,
    pub neighbors: HashMap<Node, HashSet<Node>>,
    pub order: usize,
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
            total_weight: 0,
            cumulative_edge_weights: Vec::new(),
            optimal_weighted_degrees: HashMap::new(),
            cumulative_optimal_weighted_degrees: Vec::new(),
            weights: HashMap::new(),
        }
    }

    pub fn add_edge(&mut self, u: Node, v: Node, w: usize) {
        self.edges.insert((u.clone(), v.clone(), w));
        self.weights.insert((u.clone(), v.clone()), w);
        self.total_weight += w;
        self.neighbors.entry(u.clone()).or_insert(HashSet::new()).insert(v.clone());
        self.neighbors.entry(v.clone()).or_insert(HashSet::new()).insert(u.clone());
    }

    pub fn remove_edge(&mut self, e: Edge) {
        self.edges.remove(&e);
        self.total_weight -= self.weights[&(e.0.clone(), e.1.clone())];
        self.weights.remove(&(e.0.clone(), e.1.clone()));
    }

    pub fn add_node(&mut self, u: Node) {
        self.nodes.insert(u);
    }

    pub fn remove_node(&mut self, u: Node) {
        self.nodes.remove(&u);
        for v in self.neighbors[&u].clone() {
            self.remove_edge((u.clone(), v.clone(), self.weights[&(u.clone(), v.clone())]));
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

    pub fn get_optimal_weighted_degree(&self, node: Node) -> usize {
        self.optimal_weighted_degrees[&node]
    }

    pub fn get_edge_weight(&self, e: Edge) -> usize {
        self.weights[&(e.0.clone(), e.1.clone())]
    }

    pub fn get_subset_weight_sum(&self, subset: HashSet<Node>) -> usize {
        let mut sum = 0;

        // Loop through nodes in set difference of self.nodes and subset
        for u in self.nodes.difference(&subset) {
            for v in self.nodes.difference(&subset) {
                sum += self.weights[&(u.clone(), v.clone())];
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
        let old_weight = self.weights[&(e.0.clone(), e.1.clone())];
        self.total_weight -= old_weight;
        self.weights.insert((e.0.clone(), e.1.clone()), w);
        self.total_weight += w;
    }

    pub fn update_cumulative_edge_weights(&mut self) {
        let mut cumulative_edge_weights = Vec::new();
        let mut cumulative_weight = 0;
        for e in self.edges.clone() {
            cumulative_weight += self.weights[&(e.0.clone(), e.1.clone())];
            cumulative_edge_weights.push(cumulative_weight);
        }
        self.cumulative_edge_weights = cumulative_edge_weights;
    }



