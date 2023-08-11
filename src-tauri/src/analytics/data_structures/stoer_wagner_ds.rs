#![allow(dead_code)]
#![allow(non_snake_case)]

use super::super::data_structures::cut::Cut;
use super::super::data_structures::union_find::UnionFind;
use crate::graph::graph_ds::Graph;
use crate::state::NodeKey;
use std::collections::HashSet;

pub struct StoerWagnerGraph {
    pub graph: Graph,
    pub uf: UnionFind,
    pub uncontracted: HashSet<NodeKey>,
}

impl StoerWagnerGraph {
    pub fn new(g: Graph) -> StoerWagnerGraph {
        let mut node_ids_list = Vec::new();
        for node_id in g.get_nodes() {
            node_ids_list.push(node_id.num.clone());
        }

        let uf = UnionFind::new(node_ids_list.clone());
        let mut uncontracted = HashSet::new();
        for node in node_ids_list.clone() {
            uncontracted.insert(node);
        }
        StoerWagnerGraph {
            graph: g,
            uf,
            uncontracted,
        }
    }

    pub fn get_cut(&mut self) -> Cut {
        let sets = Vec::from_iter(self.uf.get_sets());
        // if size of sets is not equal to 2, return error
        if sets.len() != 2 {
            panic!("Error: number of sets is not equal to 2");
        }

        let s = sets[0];
        let t = sets[1];

        let t_idx = self.graph.get_node_idx(t).unwrap().to_owned();
        let t_node = self
            .graph
            .get_node(t_idx)
            .expect("Index from cut should exist");

        let weight = t_node.optimal_weighted_degree;

        Cut::new(weight, s.clone(), t.clone())
    }

    pub fn contract_edge(&mut self, v1: &NodeKey, v2: &NodeKey) {
        let start_idx = self.graph.get_node_idx(v1).unwrap().to_owned();
        let finish_idx = self.graph.get_node_idx(v2).unwrap().to_owned();

        let mut start = self
            .graph
            .get_node(start_idx)
            .expect("Index from edge should exist");

        let finish = self
            .graph
            .get_node(finish_idx)
            .expect("Index from edge should exist");

        self.uf.union(v1, v2);

        for mut node in self.graph.get_neighbors(finish.num.clone()) {
            if !node.num.eq(&start.num) {
                let weight = self
                    .graph
                    .get_edge_weight(&finish.num, &node.num, None, None)
                    + self
                        .graph
                        .get_edge_weight(&start.num, &node.num, None, None);

                let node_idx = self.graph.get_node_idx(&node.num).unwrap().to_owned();

                self.graph
                    .update_edge(start_idx, node_idx, weight, None, None);

                start.optimal_weighted_degree +=
                    self.graph
                        .get_edge_weight(&finish.num, &node.num, None, None);
                node.optimal_weighted_degree +=
                    self.graph
                        .get_edge_weight(&finish.num, &node.num, None, None);
            }
        }

        self.uncontracted.remove(v2);
        self.graph.remove_node(finish_idx);
    }

    pub fn clone(&self) -> StoerWagnerGraph {
        let mut node_ids_list = Vec::new();
        for node_id in self.graph.get_nodes() {
            node_ids_list.push(node_id.num.clone());
        }

        let uf = UnionFind::new(node_ids_list.clone());
        let mut uncontracted = HashSet::new();
        for node in node_ids_list.clone() {
            uncontracted.insert(node);
        }
        StoerWagnerGraph {
            graph: self.graph.clone(),
            uf,
            uncontracted,
        }
    }
}
