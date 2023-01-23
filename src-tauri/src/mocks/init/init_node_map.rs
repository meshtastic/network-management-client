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
    #[test]
    pub fn test_init_node_map() {
        let meshnode_1: MeshNode = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: protobufs::NodeInfo {
                num: 1,
                user: Some(generate_test_user()),
                position: Some(generate_zeroed_position()),
                snr: 0.0,
                last_heard: 0,
                device_metrics: Some(generate_zeroed_device_metrics()),
            },
        };
        let meshnode_2: MeshNode = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: protobufs::NodeInfo {
                num: 2,
                user: Some(generate_test_user()),
                position: Some(generate_zeroed_position()),
                snr: 0.0,
                last_heard: 0,
                device_metrics: Some(generate_zeroed_device_metrics()),
            },
        };
        let meshnode_3 = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: protobufs::NodeInfo {
                num: 3,
                user: Some(generate_test_user()),
                position: Some(generate_zeroed_position()),
                snr: 0.0,
                last_heard: 0,
                device_metrics: Some(generate_zeroed_device_metrics()),
            },
        };
        let meshnode_4 = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: protobufs::NodeInfo {
                num: 4,
                user: Some(generate_test_user()),
                position: Some(generate_zeroed_position()),
                snr: 0.0,
                last_heard: 0,
                device_metrics: Some(generate_zeroed_device_metrics()),
            },
        };
        let meshnode_vec = vec![meshnode_1, meshnode_2, meshnode_3, meshnode_4];
        let node_map = init_node_map(meshnode_vec);
        assert_eq!(node_map.len(), 4);
    }
}
