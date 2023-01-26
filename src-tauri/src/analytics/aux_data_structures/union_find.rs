#![allow(dead_code)]
#![allow(non_snake_case)]

use std::collections::{HashMap, HashSet};

pub struct UnionFind {
    pub sets: HashMap<String, String>,
    pub reps: HashSet<String>,
    pub size: i32,
}

impl UnionFind {
    pub fn new(v: Vec<String>) -> UnionFind {
        let mut uf_ds = UnionFind {
            sets: HashMap::new(),
            reps: HashSet::new(),
            size: v.clone().len() as i32,
        };
        for node_idx in v.clone() {
            uf_ds.sets.insert(node_idx.clone(), node_idx.clone());
            uf_ds.reps.insert(node_idx.clone());
        }
        uf_ds
    }

    pub fn find(&mut self, v: String) -> String {
        if self.sets.get(&v).unwrap() == &v {
            return v.clone();
        }
        let parent = self.find(self.sets.get(&v.to_string().clone()).unwrap().clone());
        self.sets.insert(v, parent.to_string().clone());
        parent.clone()
    }

    pub fn union(&mut self, v1: String, v2: String) {
        let v1_rep = self.find(v1);
        self.sets.insert(v2.clone(), v1_rep.to_string());
        self.reps.remove(&v2.to_string().clone());
    }

    pub fn get_sets(&self) -> &HashSet<String> {
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
        let u: String = "u".to_string();
        let v: String = "v".to_string();
        let w: String = "w".to_string();

        let mut uf = UnionFind::new(vec![u.clone(), v.clone(), w.clone()]);
        uf.union(u.clone(), v.clone());

        assert_eq!(uf.find(u.clone()), uf.find(v.clone()));
    }
}
