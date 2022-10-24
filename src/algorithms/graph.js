class Graph {
    constructor() {
        this.edges = new set();
        this.nodes = new Set();
        this.neighbors = new Map();
        this.order = 0;
        this.total_weight = 0;
        this.cumulative_edge_weights = [];
        this.optimal_weighted_degrees = {};
        this.cumulative_optimal_weighted_degrees = [];
        this.weights = {};
    }

    add_edge(u, v, w) {
        this.edges.push((u, v, w));
        this.weights[(u, v)] = w;
        this.total_weight += w;
        this.neighbors[u].push(v);
        this.neighbors[v].push(u);
    }

    remove_edge(e) {
        this.edges.delete(e);
        this.total_weight -= this.weights[e];
        delete this.weights[e];
    }

    add_node(u) {
        this.nodes.push(u);
    }

    remove_node(u) {
        this.nodes.delete(u);
        for (var v of this.neighbors[u]) {
            this.remove_edge((u, v));
        }
    }
    
    get edges() {
        return this.edges;
    }

    get nodes() {
        return this.nodes;
    }

    get order() {
        return this.order;
    }
    
    get cumulative_edge_weights() {
        return this.cumulative_edge_weights;
    }

    get cumulative_optimal_weighted_degrees() {
        return this.cumulative_optimal_weighted_degrees;
    }

    get optimal_weighted_degrees() {
        return this.optimal_weighted_degrees;
    }

    get total_weight() {
        return this.total_weight;
    }

    get_optimal_weighted_degree(node) {
        return this.optimal_weighted_degrees[node];
    }

    get_edge_weight(e) {
        return this.weights[e];
    }

    get_subset_weight_sum(subset) {
        var sum = 0;
        for (var i = 0; i < subset.length; i++) {
            for (var j = i + 1; j < subset.length; j++) {
                sum += this.weights[(subset[i], subset[j])];
            }
        }
        return sum;
    }

    copy() {
        var G = new Graph();
        G.edges = this.edges;
        G.nodes = this.nodes;
        G.neighbors = this.neighbors;
        G.order = this.order;
        G.total_weight = this.total_weight;
        G.cumulative_edge_weights = this.cumulative_edge_weights;
        G.optimal_weighted_degrees = this.optimal_weighted_degrees;
        G.cumulative_optimal_weighted_degrees = this.cumulative_optimal_weighted_degrees;
        G.weights = this.weights;
        return G;
    }

    set_optimal_weighted_degree(node, val) {
        this.optimal_weighted_degrees[node] = val;
    }

    set_edge_weight(e, w) {
        const old_weight = this.weights[e];
        this.total_weight -= old_weight;
        this.weights[e] = w;
        this.total_weight += w;
    }

    update_cumulative_edge_weights() {
        this.cumulative_edge_weights = [];
        var sum = 0;
        for (var e of this.edges) {
            sum += this.weights[e];
            this.cumulative_edge_weights.push(sum);
        }
    }
}