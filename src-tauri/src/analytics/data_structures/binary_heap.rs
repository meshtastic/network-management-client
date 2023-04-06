#![allow(dead_code)]
#![allow(non_snake_case)]

use std::collections::HashMap;

use crate::graph::node::Node;

use super::stoer_wagner_ds::StoerWagnerGraph;

#[derive(Clone, Debug)]
pub struct Vertex {
    pub node: Node,
    pub weight: f64,
}

impl Vertex {
    pub fn new(node: Node, weight: f64) -> Vertex {
        Vertex { node, weight }
    }

    pub fn clone(&self) -> Vertex {
        Vertex {
            node: self.node.clone(),
            weight: self.weight,
        }
    }
}

#[derive(Clone, Debug)]
pub struct BinaryHeap {
    heap: Vec<Vertex>,
    size: i32,
    node_to_idx: HashMap<String, i32>,
}

impl BinaryHeap {
    pub fn new(G: &StoerWagnerGraph) -> BinaryHeap {
        let mut bheap = BinaryHeap {
            heap: Vec::new(),
            size: 0,
            node_to_idx: HashMap::new(),
        };

        for node_id in G.uncontracted.clone() {
            let node_idx = G.graph.get_node_idx(&node_id);
            let node = G
                .graph
                .get_node(node_idx)
                .expect("Index from graph should exist");

            let vertex = Vertex {
                node: node.clone(),
                weight: 0.0,
            };

            bheap.heap.push(vertex);
            bheap.node_to_idx.insert(node_id.clone(), bheap.size);
            bheap.size += 1;
        }

        bheap
    }

    pub fn extract_max(&mut self) -> Option<Vertex> {
        if self.size == 0 {
            return None;
        }

        let root = self.heap[0].clone();
        let leaf = self.heap[self.size as usize - 1].clone();
        self.node_to_idx.insert(root.node.name.clone(), -1);
        self.node_to_idx.insert(leaf.node.name, 0);
        self.heap[0] = self.heap[self.size as usize - 1].clone();
        self.size -= 1;
        self.heapify(None);

        Some(root)
    }

    pub fn left(&self, index: i32) -> Option<f64> {
        if index * 2 >= self.size {
            return None;
        }

        Some(self.heap[index as usize * 2].weight)
    }

    pub fn right(&self, index: i32) -> Option<f64> {
        if index * 2 + 1 >= self.size {
            return None;
        }

        Some(self.heap[index as usize * 2 + 1].weight)
    }

    pub fn swap(&mut self, ind1: i32, ind2: i32) {
        let v1 = self.heap[ind1 as usize].clone();
        let v2 = self.heap[ind2 as usize].clone();
        let tmp = self.heap[ind1 as usize].clone();

        self.heap[ind1 as usize] = self.heap[ind2 as usize].clone();
        self.heap[ind2 as usize] = tmp;

        self.node_to_idx.insert(v1.node.name, ind2);
        self.node_to_idx.insert(v2.node.name, ind1);
    }

    pub fn heapify(&mut self, root: Option<i32>) {
        let mut children = Vec::<Option<f64>>::new();

        if let Some(left) = self.left(root.unwrap_or(0)) {
            children.push(Some(left));
        } else {
            children.push(None);
        }

        if let Some(right) = self.right(root.unwrap_or(0)) {
            children.push(Some(right));
        } else {
            children.push(None);
        }

        if children[0].is_none() {
            return;
        }

        let mut max = 2 * root.unwrap_or(0);

        if children[1].is_some() && children[1].unwrap() >= children[0].unwrap() {
            max = 2 * root.unwrap_or(0) + 1;
        }

        if self.heap[max as usize].weight > self.heap[root.unwrap_or(0) as usize].weight {
            self.swap(max, root.unwrap_or(0));
            self.heapify(Some(max));
        }
    }

    pub fn update(&mut self, node: String, weight: f64) {
        let idx = self.node_to_idx.get(&node).unwrap();
        if *idx == -1 {
            return;
        }

        self.heap[*idx as usize].weight += weight;
    }

    pub fn build_heap(&mut self) {
        let start_idx = self.size / 2 - 1;
        for i in (0..start_idx + 1).rev() {
            self.heapify(Some(i));
        }
    }

    // TODO this should be replaced with the `Display` trait
    // pub fn print(&self) {
    //     for i in 0..self.size {
    //         println!(
    //             "Node: {}, Weight: {}",
    //             self.heap[i as usize].node.name, self.heap[i as usize].weight
    //         );
    //     }
    // }
}
