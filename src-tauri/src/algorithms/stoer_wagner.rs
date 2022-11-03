#![allow(dead_code)]
#![allow(non_snake_case)]

use crate::aux_data_structures::{
    binary_heap::BinaryHeap, cut::Cut, stoer_wagner_ds::StoerWagnerGraph,
};

pub fn stMinCut(G: &mut StoerWagnerGraph) -> Option<Cut> {
    let mut bheap = BinaryHeap::new(G);
    //bheap.build_heap();

    let uncontracted = G.uncontracted.clone();
    let mut S = Vec::new();

    while S.len() < uncontracted.clone().len() {
        let max = bheap.extract_max().unwrap();
        S.push(max.clone());

        for node_id in G.uncontracted.clone() {
            let w = G
                .graph
                .get_edge_weight(node_id.clone(), max.node.name.clone(), None, None);
            bheap.update(node_id.clone(), w);
        }
        bheap.build_heap();
    }

    let weight = S[S.len() - 1].weight;
    if S.len() < 2 {
        return None;
    }

    let s = S[S.len() - 1].node.name.clone();
    let t = S[S.len() - 2].node.name.clone();

    return Some(Cut::new(weight, s, t));
}

pub fn StoerWagner(graph: &mut StoerWagnerGraph) -> Cut {
    if graph.uncontracted.len() == 2 {
        return graph.get_cut();
    } else {
        let cut = stMinCut(graph).unwrap();
        graph.contract_edge(cut.get_a().to_string(), cut.get_b().to_string());
        let other_cut = StoerWagner(graph);
        if cut.get_weight() < other_cut.get_weight() {
            return cut;
        } else {
            return other_cut;
        }
    }
}

// Create a unit test for the Graph struct
#[cfg(test)]
mod tests {
    use crate::graph::graph_ds::Graph;

    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_stoer_wagner() {
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

        let mut counter_hashmap = HashMap::new();

        for _ in 0..100 {
            let graph_sw = &mut StoerWagnerGraph::new(G.clone());
            let mincut = StoerWagner(graph_sw);
            // increase the number of times mincut occurs in counter_hashmap
            let counter = counter_hashmap
                .entry(mincut.get_weight() as i32)
                .or_insert(0);
            *counter += 1;
        }
        // print the counter_hashmap
        println!("Counter hashmap: {:?}", counter_hashmap);

        assert_eq!(counter_hashmap.len(), 1);
        assert_eq!(counter_hashmap.get(&1), Some(&100));
    }
}
