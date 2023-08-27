#![allow(dead_code)]

use crate::device::MeshNode;
use std::collections::HashMap;

// This function takes a vector of MeshNodes and returns a HashMap of MeshNodes, keyed by node id.
pub fn init_node_map(meshnode_vec: Vec<MeshNode>) -> HashMap<u32, MeshNode> {
    let mut loc_hashmap: HashMap<u32, MeshNode> = HashMap::new();
    for meshnode in meshnode_vec {
        let node_id = meshnode.node_num;
        loc_hashmap.insert(node_id, meshnode);
    }
    loc_hashmap
}

#[cfg(test)]
mod tests {
    use crate::device::NormalizedPosition;

    use super::*;
    use meshtastic::protobufs;

    fn generate_test_user() -> protobufs::User {
        protobufs::User {
            id: "test".to_string(),
            long_name: "test".to_string(),
            short_name: "test".to_string(),
            macaddr: Vec::new(),
            hw_model: 0,
            is_licensed: false,
        }
    }

    #[test]
    pub fn test_init_node_map() {
        let mut meshnode_1 = MeshNode::new(1);
        meshnode_1.user = Some(generate_test_user());
        meshnode_1
            .position_metrics
            .push(NormalizedPosition::default());

        let mut meshnode_2 = MeshNode::new(2);
        meshnode_2.user = Some(generate_test_user());
        meshnode_2
            .position_metrics
            .push(NormalizedPosition::default());

        let mut meshnode_3 = MeshNode::new(3);
        meshnode_3.user = Some(generate_test_user());
        meshnode_3
            .position_metrics
            .push(NormalizedPosition::default());

        let mut meshnode_4 = MeshNode::new(4);
        meshnode_4.user = Some(generate_test_user());
        meshnode_4
            .position_metrics
            .push(NormalizedPosition::default());

        let meshnode_vec = vec![meshnode_1, meshnode_2, meshnode_3, meshnode_4];
        let node_map = init_node_map(meshnode_vec);
        assert_eq!(node_map.len(), 4);
    }
}
