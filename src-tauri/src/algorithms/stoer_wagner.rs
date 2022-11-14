#![allow(dead_code)]

use std::collections::HashMap;

use crate::aux_data_structures::{
    binary_heap::BinaryHeap, cut::Cut, stoer_wagner_ds::StoerWagnerGraph,
};

pub fn st_mincut(g: &mut StoerWagnerGraph) -> Option<Cut> {
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
        return None;
    }
    let weight = a[a.len() - 1].weight;

    let s = a[a.len() - 1].node.name.clone();
    let t = a[a.len() - 2].node.name.clone();

    return Some(Cut::new(weight, s, t));
}

pub fn stoer_wagner(graph: &mut StoerWagnerGraph) -> Option<Cut> {
    if graph.uncontracted.len() == 2 {
        return Some(graph.get_cut());
    } else {
        let mut min_cut = st_mincut(graph);
        match min_cut {
            Some(cut) => {
                graph.contract_edge(cut.get_a().to_string(), cut.get_b().to_string());
                let new_cut = stoer_wagner(graph);
                match new_cut {
                    Some(new_cut) => {
                        if new_cut.get_weight() < cut.get_weight() {
                            return Some(new_cut);
                        } else {
                            return Some(cut);
                        }
                    }
                    None => {
                        return Some(cut);
                    }
                }
            }
            None => {
                return None;
            }
        }
    }
}

pub fn recover_mincut(
    graph: &mut StoerWagnerGraph,
    all_nodes: Vec<String>,
) -> (Vec<String>, Vec<String>) {
    let mut parent_map = HashMap::new();

    for node in all_nodes {
        let parent = graph.uf.find(node.clone());
        let children = parent_map.entry(parent.clone()).or_insert(Vec::new());
        children.push(node.clone());
    }

    // get the two keys in parent_map
    let keys = Vec::from_iter(parent_map.keys());
    let s = keys[0];
    let t = keys[1];

    return (
        (*parent_map.get(s).unwrap().clone()).to_vec(),
        (*parent_map.get(t).unwrap().clone()).to_vec(),
    );
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
        let _mincut = stoer_wagner(graph_sw);

        let nodes = vec![u, v, w, x, y, z, a, b];
        let (s, t) = recover_mincut(graph_sw, nodes);

        assert!(s.len() + t.len() == 8);
        assert!(s.iter().all(|x| !t.contains(x)));

        for _ in 0..100 {
            let graph_sw = &mut StoerWagnerGraph::new(g.clone());
            let mincut = stoer_wagner(graph_sw);
            if mincut.get_weight() == 1.0 {
                correct_mincut_weight_count += 1;
            }
        }

        assert_eq!(correct_mincut_weight_count, 100);
    }
}
