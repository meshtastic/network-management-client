use crate::mesh::device::MeshNode;
use std::collections::HashMap;

pub fn init_node_map(meshnode_vec: Vec<MeshNode>) -> HashMap<u32, MeshNode> {
    let mut loc_hashmap: HashMap<u32, MeshNode> = HashMap::new();
    for meshnode in meshnode_vec {
        let node_id = meshnode.data.num;
        loc_hashmap.insert(node_id as u32, meshnode);
    }
    loc_hashmap
}

#[cfg(test)]
mod tests {
    use super::*;
}
