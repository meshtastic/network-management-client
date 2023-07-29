#![allow(dead_code)]
#![allow(non_snake_case)]

use std::collections::{HashMap, HashSet};

use crate::state::NodeKey;

pub struct UnionFind {
    pub sets: HashMap<NodeKey, NodeKey>,
    pub reps: HashSet<NodeKey>,
    pub size: i32,
}

impl UnionFind {
    pub fn new(v: Vec<NodeKey>) -> UnionFind {
        let mut uf_ds = UnionFind {
            sets: HashMap::new(),
            reps: HashSet::new(),
            size: v.len() as i32,
        };

        for node_idx in v {
            uf_ds.sets.insert(node_idx.clone(), node_idx.clone());
            uf_ds.reps.insert(node_idx.clone());
        }

        uf_ds
    }

    pub fn find(&mut self, v: &NodeKey) -> NodeKey {
        if self.sets.get(v).unwrap() == v {
            return v.clone();
        }

        let set_find_result = self.sets.get(v).unwrap().clone();
        let parent = self.find(&set_find_result);
        self.sets.insert(v.clone(), parent);
        parent
    }

    pub fn union(&mut self, v1: &NodeKey, v2: &NodeKey) {
        let v1_rep = self.find(v1);
        self.sets.insert(v2.clone(), v1_rep);
        self.reps.remove(v2);
    }

    pub fn get_sets(&self) -> &HashSet<NodeKey> {
        &self.reps
    }

    pub fn clone(&self) -> UnionFind {
        UnionFind {
            sets: self.sets.clone(),
            reps: self.reps.clone(),
            size: self.size,
        }
    }
}

// Create a unit test for the Graph struct
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_unionfind() {
        // Create a few nodes and edges and add to graph
        let u: NodeKey = 1;
        let v: NodeKey = 2;
        let w: NodeKey = 3;

        let mut uf = UnionFind::new(vec![u.clone(), v.clone(), w]);
        uf.union(&u, &v);

        assert_eq!(uf.find(&u), uf.find(&v));
    }
}
