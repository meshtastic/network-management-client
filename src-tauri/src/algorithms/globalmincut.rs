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
pub fn random_select(g: &Graph) -> Edge {
    // Calculate the cumulative edge weights
    let cumulative_edge_weights = g.get_cumulative_edge_weights();
    let total_weight = cumulative_edge_weights[cumulative_edge_weights.len() - 1];

    let r = rand::random::<f64>() * (total_weight as f64);
    let i = bisect_left(&cumulative_edge_weights, r);
    let edges = g.get_edges();
    return edges[i].clone();
}

pub fn contract(g: &Graph, k: usize) -> Graph {
    let mut g = g.clone();

    while g.get_order() > k {
        let e = random_select(&g);

        let start_idx = e.u.clone();
        let finish_idx = e.v.clone();

        let start = g.get_node(start_idx.clone());
        let finish = g.get_node(finish_idx.clone());

        for node in g.get_neighbors(finish.name.clone()) {
            if !node.name.eq(&start.name) {
                let weight =
                    g.get_edge_weight(finish.name.clone(), node.name.clone(), None, Some(true));
                g.add_edge(start.name.clone(), node.name.clone(), weight);
            }
        }
        g.remove_node(finish_idx.clone());
    }
    return g.clone();
}

pub fn karger_stein_gmincut(g: &Graph, n: i32) -> f64 {
    if n <= 6 {
        let g_prime = contract(g, 2);
        let mut cut_sum = 0.0;
        for edge in g_prime.get_edges() {
            cut_sum += edge.weight;
        }
        return cut_sum;
    } else {
        let n = (n as f64 / 2.0f64.sqrt()) as i32 + 1;
        let g_prime_1 = contract(g, n as usize);
        let g_prime_1_min_cut = karger_stein_gmincut(&g_prime_1, n);

        let g_prime_2 = contract(g, n as usize);
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
        let mut g = Graph::new();

        // Add nodes
        let u = "u".to_string();
        let v = "v".to_string();
        let w = "w".to_string();
        let x = "x".to_string();
        let y = "y".to_string();
        let z = "z".to_string();
        let a = "a".to_string();
        let b = "b".to_string();

        g.add_node(u.clone());
        g.add_node(v.clone());
        g.add_node(w.clone());
        g.add_node(x.clone());
        g.add_node(y.clone());
        g.add_node(z.clone());
        g.add_node(a.clone());
        g.add_node(b.clone());

        // Add edges
        g.add_edge(u.clone(), v.clone(), 1.0);
        g.add_edge(u.clone(), w.clone(), 1.0);
        g.add_edge(u.clone(), x.clone(), 1.0);
        g.add_edge(w.clone(), x.clone(), 1.0);
        g.add_edge(v.clone(), y.clone(), 1.0);
        g.add_edge(x.clone(), y.clone(), 1.0);
        g.add_edge(w.clone(), z.clone(), 1.0);
        g.add_edge(x.clone(), a.clone(), 1.0);
        g.add_edge(y.clone(), b.clone(), 1.0);

        let mut mincut_2 = 0;
        for _ in 0..1000 {
            let order = g.get_order();
            let mincut = karger_stein_gmincut(&g.clone(), order as i32);
            if mincut == 1.0 {
                mincut_2 += 1;
            }
        }

        println!("{} out of 1000", mincut_2);
    }
}
