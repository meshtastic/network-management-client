#![allow(dead_code)]

use crate::device::MeshNode;
use std::collections::HashMap;

// This function takes a vector of MeshNodes and returns a HashMap of MeshNodes, keyed by node id.
pub fn init_node_map(meshnode_vec: Vec<MeshNode>) -> HashMap<u32, MeshNode> {
    let mut loc_hashmap: HashMap<u32, MeshNode> = HashMap::new();
    for meshnode in meshnode_vec {
        let node_id = meshnode.data.num;
        loc_hashmap.insert(node_id, meshnode);
    }
    loc_hashmap
}

#[cfg(test)]
mod tests {
    use super::*;
    use app::protobufs;

    fn generate_zeroed_position() -> protobufs::Position {
        protobufs::Position::default()
    }

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

    fn generate_zeroed_device_metrics() -> protobufs::DeviceMetrics {
        protobufs::DeviceMetrics {
            battery_level: 0,
            voltage: 0.0,
            channel_utilization: 0.0,
            air_util_tx: 0.0,
        }
    }

    #[test]
    pub fn test_init_node_map() {
        let meshnode_1: MeshNode = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: protobufs::NodeInfo {
                num: 1,
                user: Some(generate_test_user()),
                position: Some(generate_zeroed_position()),
                device_metrics: Some(generate_zeroed_device_metrics()),
                ..Default::default()
            },
        };
        let meshnode_2: MeshNode = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: protobufs::NodeInfo {
                num: 2,
                user: Some(generate_test_user()),
                position: Some(generate_zeroed_position()),
                device_metrics: Some(generate_zeroed_device_metrics()),
                ..Default::default()
            },
        };

        let meshnode_3 = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: protobufs::NodeInfo {
                num: 3,
                user: Some(generate_test_user()),
                position: Some(generate_zeroed_position()),
                device_metrics: Some(generate_zeroed_device_metrics()),
                ..Default::default()
            },
        };

        let meshnode_4 = MeshNode {
            device_metrics: vec![],
            environment_metrics: vec![],
            data: protobufs::NodeInfo {
                num: 4,
                user: Some(generate_test_user()),
                position: Some(generate_zeroed_position()),
                device_metrics: Some(generate_zeroed_device_metrics()),
                ..Default::default()
            },
        };

        let meshnode_vec = vec![meshnode_1, meshnode_2, meshnode_3, meshnode_4];
        let node_map = init_node_map(meshnode_vec);
        assert_eq!(node_map.len(), 4);
    }
}
