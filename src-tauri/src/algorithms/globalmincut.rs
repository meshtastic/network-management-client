#![allow(dead_code)]

use crate::graph::edge::Edge;
use crate::graph::graph_ds::Graph;

/// Locate the insertion point for x in a to maintain sorted order.
/// If x is already present in a, the insertion point will be before
/// (to the left of) any existing entries.
///
/// The returned insertion point i partitions the array a into two
/// halves so that all(val < x for val in a[lo : i]) for the left
/// side and all(val >= x for val in a[i : hi]) for the right side.
///
/// * Arguments
///
/// * `a` - The sorted slice to search.
/// * `x` - The value to search for.
pub fn bisect_left<T: PartialOrd>(a: &[T], x: T) -> usize {
    let mut lo = 0;
    let mut hi = a.len();

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

/// Returns the edge picked randomly proportional to the weight of the edge
///
/// * Arguments
///
/// * `G` - The graph to pick the edge from
pub fn random_select(G: &Graph) -> Edge {
    // Calculate the cumulative edge weights
    let cumulative_edge_weights = G.get_cumulative_edge_weights();
    let total_weight = cumulative_edge_weights[cumulative_edge_weights.len() - 1];

    let r = rand::random::<f64>() * (total_weight as f64);
    let i = bisect_left(&cumulative_edge_weights, r);
    let edges = G.get_edges();
    return edges[i].clone();
}

pub fn contract(G: &Graph, k: usize) -> Graph {
    let mut G = G.clone();

    while G.get_order() > k {
        let e = random_select(&G);

        let start_idx = e.u.clone();
        let finish_idx = e.v.clone();

        let start = G.get_node(start_idx.clone());
        let finish = G.get_node(finish_idx.clone());

        for node in G.get_neighbors(finish.name.clone()) {
            if !node.name.eq(&start.name) {
                let weight =
                    G.get_edge_weight(finish.name.clone(), node.name.clone(), None, Some(true));
                G.add_edge(start.name.clone(), node.name.clone(), weight);
            }
        }
        G.remove_node(finish_idx.clone());
    }
    return G.clone();
}

pub fn karger_stein_gmincut(G: &Graph, n: i32) -> f64 {
    if n <= 6 {
        let g_prime = contract(G, 2);
        let mut cut_sum = 0.0;
        for edge in g_prime.get_edges() {
            cut_sum += edge.weight;
        }
        return cut_sum;
    } else {
        let n = (n as f64 / 2.0f64.sqrt()) as i32 + 1;
        let g_prime_1 = contract(G, n as usize);
        let g_prime_1_min_cut = karger_stein_gmincut(&g_prime_1, n);

        let g_prime_2 = contract(G, n as usize);
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
    use super::*;

    #[test]
    fn run_globalmincut() {
        // Create a graph
        let mut G = Graph::new();

        // Add nodes
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();
        let x: String = "x".to_string();
        let y: String = "y".to_string();
        let z: String = "z".to_string();
        let a: String = "a".to_string();
        let b: String = "b".to_string();

        G.add_node(u.clone());
        G.add_node(v.clone());
        G.add_node(w.clone());
        G.add_node(x.clone());
        G.add_node(y.clone());
        G.add_node(z.clone());
        G.add_node(a.clone());
        G.add_node(b.clone());

        // Add edges
        G.add_edge(u.clone(), v.clone(), 1.0);
        G.add_edge(u.clone(), w.clone(), 1.0);
        G.add_edge(u.clone(), x.clone(), 1.0);
        G.add_edge(w.clone(), x.clone(), 1.0);
        G.add_edge(v.clone(), y.clone(), 1.0);
        G.add_edge(x.clone(), y.clone(), 1.0);
        G.add_edge(w.clone(), z.clone(), 1.0);
        G.add_edge(x.clone(), a.clone(), 1.0);
        G.add_edge(y.clone(), b.clone(), 1.0);

        let mut mincut_2 = 0;
        for _ in 0..1000 {
            let order = G.get_order();
            let mincut = karger_stein_gmincut(&G.clone(), order as i32);
            if mincut == 1.0 {
                mincut_2 += 1;
            }
        }

        println!("{} out of 1000", mincut_2);
    }
}
