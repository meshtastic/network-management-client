/*
Generates mock protobufs of struct types below
*/

pub fn mock_generator(num_nodes: i32) -> neighborinfo_protobuf::NeighborInfo {
    let mut neighborinfo = neighborinfo_protobuf::NeighborInfo::new();
    neighborinfo.set_selfnode(mock_proto_node());
    neighborinfo.set_neighbors(RepeatedField::from_vec(vec![
        mock_proto_neighbor(),
        num_nodes,
    ]));
    neighborinfo
}

#[cfg(test)]
mod tests {
    use super::*;

    /* Generate a random number of protobufs */
    fn test_init_three_nodes() {
        let neighborinfo = mock_generator(3);
        assert_eq!(neighborinfo.get_neighbors().len(), 3);
    }
}
