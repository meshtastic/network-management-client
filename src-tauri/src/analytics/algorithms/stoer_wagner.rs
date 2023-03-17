#![allow(dead_code)]

use super::super::algo_result_enums::{mincut::MinCutResult, sw_cut::SWCutResult};
use super::super::aux_data_structures::{
    binary_heap::BinaryHeap, cut::Cut, stoer_wagner_ds::StoerWagnerGraph,
};
use std::collections::HashMap;

pub fn st_mincut(g: &mut StoerWagnerGraph) -> SWCutResult {
    let mut bheap = BinaryHeap::new(g);

    let uncontracted = g.uncontracted.clone();
    let mut a = Vec::new();

    while a.len() < uncontracted.clone().len() {
        let max = bheap.extract_max().unwrap();
        a.push(max.clone());

        for node_id in g.uncontracted.clone() {
            let w = g
                .graph
                .get_edge_weight(node_id.clone(), max.node.name.clone(), None, None);
            bheap.update(node_id.clone(), w);
        }
        bheap.build_heap();
    }
    if a.len() < 2 {
        return SWCutResult::Error("Error in st_mincut".to_string());
    }
    let weight = a[a.len() - 1].weight;

    let s = a[a.len() - 1].node.name.clone();
    let t = a[a.len() - 2].node.name.clone();

    SWCutResult::Success(Cut::new(weight, s, t))
}

pub fn stoer_wagner(graph: &mut StoerWagnerGraph) -> SWCutResult {
    if graph.uncontracted.len() == 2 {
        return SWCutResult::Success(graph.get_cut());
    }

    let opt_cut = st_mincut(graph);
    match opt_cut {
        SWCutResult::Success(cut) => {
            graph.contract_edge(cut.get_a().to_string(), cut.get_b().to_string());
            let opt_other_cut = stoer_wagner(graph);
            match opt_other_cut {
                SWCutResult::Success(other_cut) => {
                    if cut.get_weight() < other_cut.get_weight() {
                        return SWCutResult::Success(cut);
                    }

                    SWCutResult::Success(other_cut)
                }
                SWCutResult::Error(other_err_str) => SWCutResult::Error(other_err_str),
                SWCutResult::Empty(other_empty) => SWCutResult::Empty(other_empty),
            }
        }
        SWCutResult::Error(err_str) => SWCutResult::Error(err_str),
        SWCutResult::Empty(empty) => SWCutResult::Empty(empty),
    }
}

pub fn recover_mincut(graph: &mut StoerWagnerGraph, all_nodes: Vec<String>) -> MinCutResult {
    let mut parent_map = HashMap::new();

    for node in all_nodes {
        let parent = graph.uf.find(node.clone());
        let children: &mut Vec<String> = parent_map.entry(parent.clone()).or_default();
        children.push(node.clone());
    }

    // get the two keys in parent_map
    let keys = Vec::from_iter(parent_map.keys());
    let s = keys[0];
    let t = keys[1];

    let s_cut = parent_map.get(s).unwrap().clone();
    let t_cut = parent_map.get(t).unwrap().clone();

    let mut st_cut_edges = Vec::new();

    for node_s in s_cut {
        for node_t in &t_cut {
            let edge = graph.graph.get_edge(node_s.clone(), node_t.clone());

            if let Some(e) = edge {
                st_cut_edges.push(e.clone());
            }
        }
    }

    MinCutResult::Success(st_cut_edges)
}

// Create a unit test for the stoer-wagner algorithm
#[cfg(test)]
mod tests {
    use crate::graph::graph_ds::Graph;

    use super::*;

    #[test]
    fn test_stoer_wagner() {
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
        g.add_edge(v.clone(), y.clone(), 1.0);
        g.add_edge(x.clone(), y.clone(), 1.0);
        g.add_edge(w.clone(), z.clone(), 1.0);
        g.add_edge(x.clone(), a.clone(), 1.0);
        g.add_edge(y.clone(), b.clone(), 1.0);

        let mut correct_mincut_weight_count = 0;

        let graph_sw = &mut StoerWagnerGraph::new(g.clone());

        let mincut = stoer_wagner(graph_sw);

        match mincut {
            SWCutResult::Success(cut) => {
                assert_eq!(cut.get_weight(), 1.0);
                let nodes = vec![u, v, w, x, y, z, a, b];
                let mincut_edges_res = recover_mincut(graph_sw, nodes);

                match mincut_edges_res {
                    MinCutResult::Success(mincut_edges) => {
                        assert_eq!(mincut_edges.len(), 1);
                    }
                    MinCutResult::Error(err_str) => {
                        println!("Error: {}", err_str);
                    }
                    MinCutResult::Empty(empty) => {
                        println!("Empty: {}", empty);
                    }
                }
            }
            SWCutResult::Error(err_str) => {
                println!("Error: {}", err_str);
            }
            SWCutResult::Empty(empty) => {
                println!("Empty: {}", empty);
            }
        }

        for _ in 0..100 {
            let graph_sw = &mut StoerWagnerGraph::new(g.clone());

            let mincut_res = stoer_wagner(graph_sw);
            match mincut_res {
                SWCutResult::Success(cut) => {
                    if cut.get_weight() == 1.0 {
                        correct_mincut_weight_count += 1;
                    }
                }
                SWCutResult::Error(err_str) => {
                    println!("Error: {}", err_str);
                }
                SWCutResult::Empty(empty) => {
                    println!("Empty: {}", empty);
                }
            }
        }

        assert_eq!(correct_mincut_weight_count, 100);
    }
}
