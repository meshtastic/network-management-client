#![allow(dead_code)]

use crate::graph_p::Edge;
use crate::graph_p::Graph;

pub fn bisect_left<T: PartialOrd>(a: &[T], x: T) -> usize {
    let mut lo = 0;
    let mut hi = a.len();

    if lo < 0 {
        panic!("lo must be non-negative");
    }
    if hi == 0 {
        hi = a.len();
    }
    while lo < hi {
        let mid = (lo + hi) / 2;
        if a[mid] < x {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

pub fn random_select(G: &Graph) -> Edge {
    // Calculate the cumulative edge weights
    let cumulative_edge_weights = G.get_cumulative_edge_weights();
    println!("cumulative_edge_weights: {:?}", cumulative_edge_weights);
    let total_weight = cumulative_edge_weights[cumulative_edge_weights.len() - 1];

    let r = rand::random::<f64>() * (total_weight as f64);
    let i = bisect_left(&cumulative_edge_weights, r);
    let edges = G.get_edges();
    return edges[i].clone();
}

/*
pub fn contract_edge(G: &mut Graph, edge: &Edge) {
    {
        let u_idx = edge.u.clone();
        let v_idx = edge.v.clone();

        let node_u = G.g.node_weight(u_idx).unwrap();
        let node_v = G.g.node_weight(v_idx).unwrap();

        let u_weighted_degree = node_u.optimal_weighted_degree;
        let v_weighted_degree = node_v.optimal_weighted_degree;

        let edge_weight = edge.weight;

        let new_value = u_weighted_degree + v_weighted_degree - 2.0 * edge_weight;

        G.change_node_opt_weight(u_idx, new_value);
        G.change_node_opt_weight(v_idx, 0 as f64);
    }

    let u_idx = edge.u.clone();
    let v_idx = edge.v.clone();
    let node_u = G.get_node(u_idx.clone());
    let node_v = G.get_node(v_idx.clone());

    println!("Edge: {:?} {:?}", node_u, node_v);

    G.update_edge(node_u.name.clone(), node_v.name.clone(), 0 as f64);
    G.update_edge(node_v.name.clone(), node_u.name.clone(), 0 as f64);

    for node in G.get_nodes() {
        if node != node_u.clone() && node != node_v.clone() {
            // edge = (u, v)
            let weight = G.get_edge_weight(node_u.name.clone(), node.name.clone())
                + G.get_edge_weight(node_v.name.clone(), node.name.clone());
            G.update_edge(node_u.name.clone(), node.name.clone(), weight);
            let weight = G.get_edge_weight(node.name.clone(), node_u.name.clone())
                + G.get_edge_weight(node.name.clone(), node_v.name.clone());
            G.update_edge(node.name.clone(), node_u.name.clone(), weight);
            G.update_edge(node_v.name.clone(), node.name.clone(), 0 as f64);
            G.update_edge(node.name.clone(), node_v.name.clone(), 0 as f64);
        }
    }
}

pub fn contract(G: &Graph, k: usize) -> Graph {
    let mut g_prime = G.clone();
    let n = g_prime.get_order();
    while g_prime.get_order() > k {
        println!("Order: {}", g_prime.get_order());
        let e = random_select(&g_prime);
        contract_edge(&mut g_prime, &e);
        let node_u = g_prime.g.node_weight(e.u).unwrap();
        let node_v = g_prime.g.node_weight(e.v).unwrap();
        g_prime.remove_edge(node_u.name.clone(), node_v.name.clone());
    }
    let edges = g_prime.get_edges();
    g_prime
}
*/

pub fn contract_2(G: &Graph, k: usize) -> Graph {
    let mut G = G.clone();

    while G.get_order() > k {
        let e = random_select(&G);

        let start_idx = e.u.clone();
        let finish_idx = e.v.clone();

        let start = G.get_node(start_idx.clone());
        let finish = G.get_node(finish_idx.clone());

        println!(
            "Random Edge: {:?} {:?}",
            start.name.clone(),
            finish.name.clone()
        );

        for node in G.get_neighbors(finish.name.clone()) {
            if !node.name.eq(&start.name) {
                let weight =
                    G.get_edge_weight(finish.name.clone(), node.name.clone(), None, Some(true));
                G.add_edge(start.name.clone(), node.name.clone(), weight);
            }
        }

        G.remove_node(finish_idx.clone());
    }

    // print the edges
    for edge in G.get_edges() {
        let start = G.get_node(edge.u.clone());
        let finish = G.get_node(edge.v.clone());
        println!("Edge: {:?} {:?}", start.name.clone(), finish.name.clone());
    }
    return G.clone();
}

pub fn karger_stein_gmincut(G: &Graph, n: i32) -> f64 {
    if n <= 6 {
        let g_prime = contract_2(G, 2);
        let mut cut_sum = 0.0;
        for edge in g_prime.get_edges() {
            cut_sum += edge.weight;
        }
        return cut_sum;
    } else {
        let n = (n as f64 / 2.0f64.sqrt()) as i32 + 1;
        let g_prime_1 = contract_2(G, n as usize);
        let g_prime_1_min_cut = karger_stein_gmincut(&g_prime_1, n);

        let g_prime_2 = contract_2(G, n as usize);
        let g_prime_2_min_cut = karger_stein_gmincut(&g_prime_2, n);

        if g_prime_1_min_cut > g_prime_2_min_cut {
            return g_prime_2_min_cut;
        } else {
            return g_prime_1_min_cut;
        }
    }
}

// Create a unit test for the Graph struct
#[cfg(test)]
mod tests {
    use std::env;

    use super::*;

    #[test]
    fn run_globalmincut() {
        env::set_var("RUST_BACKTRACE", "1");
        // Create a graph
        let mut G = Graph::new();

        // Add nodes
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();
        let x: String = "x".to_string();
        let y: String = "y".to_string();

        G.add_node(u.clone());
        G.add_node(v.clone());
        G.add_node(w.clone());
        G.add_node(x.clone());
        G.add_node(y.clone());

        // Add edges
        G.add_edge(u.clone(), v.clone(), 1.0);
        G.add_edge(u.clone(), w.clone(), 1.0);
        G.add_edge(u.clone(), x.clone(), 1.0);
        G.add_edge(w.clone(), x.clone(), 1.0);
        G.add_edge(v.clone(), y.clone(), 1.0);
        G.add_edge(x.clone(), y.clone(), 1.0);

        for edge in G.get_edges() {
            let node_u = G.g.node_weight(edge.u.clone()).unwrap();
            let node_v = G.g.node_weight(edge.v.clone()).unwrap();
            println!(
                "Edge: (Name: {} - Degree Weight: {}) <-> (Name: {} - Degree Weight: {}) with weight {}",
                node_u.name, node_u.optimal_weighted_degree, node_v.name, node_v.optimal_weighted_degree, edge.weight
            );
        }
        // Run the algorithm 50 times and save the times where mincut is 2 to a variable
        let mut mincut_2 = 0;
        for _ in 0..10000 {
            let order = G.get_order();
            let mincut = karger_stein_gmincut(&G.clone(), order as i32);
            if mincut == 2.0 {
                mincut_2 += 1;
            }
        }

        println!("{} out of 10000", mincut_2);
        //let order = G.get_order();
        //let mincut = karger_stein_gmincut(&G, order as i32);
        //println!("mincut: {}", mincut);
    }
}
