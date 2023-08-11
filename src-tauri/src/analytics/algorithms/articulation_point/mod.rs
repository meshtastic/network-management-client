#![allow(clippy::too_many_arguments)]

pub mod results;

use super::AlgorithmRunner;
use crate::{graph::graph_ds::Graph, state::NodeKey};
use defaultdict::DefaultHashMap;
use results::APResult;
use std::cmp::min;

pub struct ArticulationPointRunner;

pub struct ArticulationPointParams;

impl AlgorithmRunner for ArticulationPointRunner {
    type Parameters = ArticulationPointParams;
    type Result = APResult;

    fn new(_params: Self::Parameters) -> Self {
        ArticulationPointRunner
    }

    fn run(&mut self, graph: &crate::graph::graph_ds::Graph) -> Self::Result {
        let mut disc = DefaultHashMap::<NodeKey, i32>::new();
        let mut low = DefaultHashMap::<NodeKey, i32>::new();
        let mut visited = DefaultHashMap::<NodeKey, bool>::new();
        let mut ap = DefaultHashMap::<NodeKey, bool>::new();
        let mut time = 0;
        let parent = u32::MAX; // This could fail, but would be extremely unlikely

        for node in graph.get_nodes() {
            if !visited.get(&node.num) {
                articulation_point_helper(
                    graph,
                    node.num,
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
                let index = match graph.get_node_idx(key) {
                    Some(i) => i.to_owned(),
                    None => continue,
                };
                articulation_points.push(index);
            }
        }

        APResult::Success(articulation_points)
    }
}

fn articulation_point_helper(
    graph: &Graph,
    node_idx: NodeKey,
    visited: &mut DefaultHashMap<NodeKey, bool>,
    disc: &mut DefaultHashMap<NodeKey, i32>,
    low: &mut DefaultHashMap<NodeKey, i32>,
    time: &mut usize,
    parent: NodeKey,
    ap: &mut DefaultHashMap<NodeKey, bool>,
) {
    let mut children = 0;
    visited.insert(node_idx.clone(), true);

    *time += 1;
    disc.insert(node_idx.clone(), *time as i32);
    low.insert(node_idx.clone(), *time as i32);

    let neighbors = graph.get_neighbors(node_idx.clone());
    for neighbor in neighbors {
        if !visited.get(&neighbor.num) {
            children += 1;
            articulation_point_helper(
                graph,
                neighbor.num.clone(),
                visited,
                disc,
                low,
                time,
                node_idx.clone(),
                ap,
            );
            low.insert(
                node_idx.clone(),
                min(*low.get(&node_idx), *low.get(&neighbor.num)),
            );

            if !parent.eq(&u32::MAX) && low.get(&neighbor.num) >= disc.get(&node_idx) {
                ap.insert(node_idx.clone(), true);
            }
        } else if !neighbor.num.eq(&parent) {
            low.insert(
                node_idx.clone(),
                min(*low.get(&node_idx), *disc.get(&neighbor.num)),
            );
        }
    }

    if parent.eq(&u32::MAX) && children > 1 {
        ap.insert(node_idx, true);
    }
}

// // Create a unit test for the Graph struct
// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn graph_with_articulation_point() {
//         // Create a graph
//         let mut g = Graph::new();

//         // Add nodes
//         let u: NodeKey = 1;
//         let v: NodeKey = 2;
//         let w: NodeKey = 3;
//         let x: NodeKey = 4;
//         let y: NodeKey = 5;
//         let z: NodeKey = 6;
//         let a: NodeKey = 7;
//         let b: NodeKey = 8;

//         g.add_node(u.clone());
//         g.add_node(v.clone());
//         g.add_node(w.clone());
//         g.add_node(x.clone());
//         g.add_node(y.clone());
//         g.add_node(z.clone());
//         g.add_node(a.clone());
//         g.add_node(b.clone());

//         // Add edges
//         g.add_edge(u.clone(), v.clone(), 1.0);
//         g.add_edge(u.clone(), w.clone(), 1.0);
//         g.add_edge(u.clone(), x.clone(), 1.0);
//         g.add_edge(w.clone(), x.clone(), 1.0);
//         g.add_edge(v, y.clone(), 1.0);
//         g.add_edge(x.clone(), y.clone(), 1.0);
//         g.add_edge(w, z, 1.0);
//         g.add_edge(x.clone(), a, 1.0);
//         g.add_edge(y, b, 1.0);

//         println!("\n");

//         // Test the articulation point function
//         let mut runner = ArticulationPointRunner::new(ArticulationPointParams);
//         let articulation_points_res = runner.run(&g);

//         match articulation_points_res {
//             APResult::Success(aps) => {
//                 let len_articulation_points = aps.len();
//                 assert_eq!(len_articulation_points, 3);
//                 // Check if node u is an articulation point
//                 assert!(!aps.contains(&g.get_node_idx(&u)));
//                 assert!(aps.contains(&g.get_node_idx(&x)));
//                 println!("Articulation Points: {:?}", aps);
//             }
//             APResult::Error(aps) => {
//                 println!("Articulation Points: {:?}", aps);
//             }
//             APResult::Empty(b) => {
//                 println!("This won't happen. {:?}", b);
//             }
//         }
//     }
// }
