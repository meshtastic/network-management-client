#![allow(dead_code)]
#![allow(clippy::too_many_arguments)]

use super::super::algo_result_enums::ap::APResult;
use crate::graph::graph_ds::Graph;
use core::cmp::min;
use defaultdict::DefaultHashMap;

pub fn articulation_point_helper(
    graph: &Graph,
    node_idx: String,
    visited: &mut DefaultHashMap<String, bool>,
    disc: &mut DefaultHashMap<String, i32>,
    low: &mut DefaultHashMap<String, i32>,
    time: &mut usize,
    parent: String,
    ap: &mut DefaultHashMap<String, bool>,
) {
    let mut children = 0;
    visited.insert(node_idx.clone(), true);

    *time += 1;
    disc.insert(node_idx.clone(), *time as i32);
    low.insert(node_idx.clone(), *time as i32);

    let neighbors = graph.get_neighbors(node_idx.clone());
    for neighbor in neighbors {
        if !visited.get(&neighbor.name) {
            children += 1;
            articulation_point_helper(
                graph,
                neighbor.name.clone(),
                visited,
                disc,
                low,
                time,
                node_idx.clone(),
                ap,
            );
            low.insert(
                node_idx.clone(),
                min(*low.get(&node_idx), *low.get(&neighbor.name)),
            );

            if !parent.eq("-1") && low.get(&neighbor.name) >= disc.get(&node_idx) {
                ap.insert(node_idx.clone(), true);
            }
        } else if !neighbor.name.eq(&parent) {
            low.insert(
                node_idx.clone(),
                min(*low.get(&node_idx), *disc.get(&neighbor.name)),
            );
        }
    }

    if parent.eq("-1") && children > 1 {
        ap.insert(node_idx, true);
    }
}

pub fn articulation_point(graph: &Graph) -> APResult {
    let mut disc = DefaultHashMap::<String, i32>::new();
    let mut low = DefaultHashMap::<String, i32>::new();
    let mut visited = DefaultHashMap::<String, bool>::new();
    let mut ap = DefaultHashMap::<String, bool>::new();
    let mut time = 0;
    let parent = "-1".to_string();

    for node in graph.get_nodes() {
        if !visited.get(&node.name) {
            articulation_point_helper(
                graph,
                node.name,
                &mut visited,
                &mut disc,
                &mut low,
                &mut time,
                parent.clone(),
                &mut ap,
            );
        }
    }

    let mut articulation_points = Vec::new();
    for key in ap.keys() {
        if *ap.get(key) {
            articulation_points.push(graph.get_node_idx(key.to_string()));
        }
    }

    APResult::Success(articulation_points)
}

// Create a unit test for the Graph struct
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn graph_with_articulation_point() {
        // Create a graph
        let mut g = Graph::new();

        // Add nodes
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();
        let x: String = "x".to_string();
        let y: String = "y".to_string();
        let z: String = "z".to_string();
        let a: String = "a".to_string();
        let b: String = "b".to_string();

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
        g.add_edge(v, y.clone(), 1.0);
        g.add_edge(x.clone(), y.clone(), 1.0);
        g.add_edge(w, z, 1.0);
        g.add_edge(x.clone(), a, 1.0);
        g.add_edge(y, b, 1.0);

        println!("\n");

        // Test the articulation point function
        let articulation_points_res = articulation_point(&g);
        match articulation_points_res {
            APResult::Success(aps) => {
                let len_articulation_points = aps.len();
                assert_eq!(len_articulation_points, 3);
                // Check if node u is an articulation point
                assert!(!aps.contains(&g.get_node_idx(u)));
                assert!(aps.contains(&g.get_node_idx(x)));
                println!("Articulation Points: {:?}", aps);
            }
            APResult::Error(aps) => {
                println!("Articulation Points: {:?}", aps);
            }
            APResult::Empty(b) => {
                println!("This won't happen. {:?}", b);
            }
        }
    }
}
