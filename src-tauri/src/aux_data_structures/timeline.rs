// A data structure to represent the timeline of graph snapshots.
use crate::aux_functions::take_snapshot::take_snapshot_of_graph;
use crate::graph::graph_ds::Graph;
use postgres::{Client, NoTls};

// Created at the beginning of each rescue attempt.
pub struct Timeline {
    curr_snapshot: Option<Graph>,
    client: Client,
    curr_timeline_id: i32,
    curr_snapshot_id: i32,
}

impl Timeline {
    pub fn new(link: &str) -> Timeline {
        let mut config = postgres::Config::new();

        config
            .user("barkin")
            .password("zbRH6C32$f2N")
            .dbname("timelines1")
            .host("localhost")
            .port(5432);

        let mut client = config.connect(NoTls).unwrap(); //Client::connect(params, NoTls).unwrap();
        let mut curr_timeline_id = 0;

        for row in client
            .query("SELECT MAX(timeline_id) FROM timelinestable1", &[])
            .unwrap_or(Vec::new())
        {
            let timeline_id: i32 = row.get(0);
            curr_timeline_id = timeline_id + 1;
        }

        Timeline {
            curr_snapshot: None,
            client,
            curr_timeline_id,
            curr_snapshot_id: 0,
        }
    }

    pub fn add_snapshot(&mut self, snapshot: Graph) {
        match &self.curr_snapshot {
            None => {
                self.curr_snapshot = Some(snapshot);
            }
            Some(_curr_snapshot) => {
                let is_connected = self.check_connection(&snapshot);
                self.write();
                self.curr_snapshot = Some(snapshot);
                if !is_connected {
                    self.curr_timeline_id += 1;
                }
            }
        }
        self.curr_snapshot_id += 1;
    }

    pub fn check_connection(&mut self, other_snapshot: &Graph) -> bool {
        match &self.curr_snapshot {
            None => true,
            Some(curr_snapshot) => {
                let g1_order = curr_snapshot.get_order();
                let g2_order = other_snapshot.get_order();
                let diff = (g1_order as i32 - g2_order as i32).abs();
                if diff >= 1 {
                    return false;
                }
                true
            }
        }
    }

    pub fn get_curr_snapshot(&self) -> Option<Graph> {
        match self.curr_snapshot {
            None => None,
            Some(ref curr_snapshot) => Some(curr_snapshot.clone()),
        }
    }

    pub fn write(&mut self) {
        let curr_snapshot = self.curr_snapshot.as_ref().expect("msg");
        let snapshot_string = take_snapshot_of_graph(curr_snapshot);

        println!("{}", snapshot_string);

        let snapshot_id = self.curr_snapshot_id;
        let timeline_id = self.curr_timeline_id;
        let query_str =
            "INSERT INTO timelinestable1 (timeline_id, snapshot_id, dats) VALUES ($1, $2, $3)";

        self.client
            .execute(query_str, &[&timeline_id, &snapshot_id, &snapshot_string])
            .unwrap();
    }

    pub fn clear(&mut self) {
        self.curr_snapshot = None;
    }
}

#[cfg(test)]
mod tests {
    use crate::graph::{edge::Edge, node::Node};

    use super::*;

    #[test]
    fn test_timeline() {
        let mut timeline = Timeline::new("");

        let mut G1 = Graph::new();

        // Create a few nodes and edges and add to graph
        let a: String = "a".to_string();
        let b: String = "b".to_string();
        let c: String = "c".to_string();
        let d: String = "d".to_string();

        let mut a_node = Node::new(a.clone());
        a_node.set_gps(-72.28486, 43.71489, 1.0);
        let a_idx = G1.add_node_from_struct(a_node);

        let mut b_node = Node::new(b.clone());
        b_node.set_gps(-72.28239, 43.71584, 1.0);
        let b_idx = G1.add_node_from_struct(b_node);

        let mut c_node = Node::new(c.clone());
        c_node.set_gps(-72.28332, 43.7114, 1.0);
        let c_idx = G1.add_node_from_struct(c_node);

        let mut d_node = Node::new(d.clone());
        d_node.set_gps(-72.28085, 43.71235, 1.0);
        let d_idx = G1.add_node_from_struct(d_node);

        // 0: a, 1: b, 2: c, 3: d
        let a_b = Edge::new(a_idx, b_idx, 0.51);
        G1.add_edge_from_struct(a_b);

        let a_c = Edge::new(a_idx, c_idx, 0.39);
        G1.add_edge_from_struct(a_c);

        let b_c = Edge::new(b_idx, c_idx, 0.4);
        G1.add_edge_from_struct(b_c);

        let b_d = Edge::new(b_idx, d_idx, 0.6);
        G1.add_edge_from_struct(b_d);

        let mut G2 = Graph::new();

        // Create a few nodes and edges and add to graph
        let a: String = "a".to_string();
        let b: String = "b".to_string();
        let c: String = "c".to_string();
        let d: String = "d".to_string();

        let mut a_node = Node::new(a.clone());
        a_node.set_gps(-72.28239, 43.71489, 1.0);
        let a_idx = G2.add_node_from_struct(a_node);

        let mut b_node = Node::new(b.clone());
        b_node.set_gps(-72.28486, 43.71584, 1.0);
        let b_idx = G2.add_node_from_struct(b_node);

        let mut c_node = Node::new(c.clone());
        c_node.set_gps(-72.28332, 43.7114, 1.0);
        let c_idx = G2.add_node_from_struct(c_node);

        let mut d_node = Node::new(d.clone());
        d_node.set_gps(-72.28085, 43.71235, 1.0);
        let d_idx = G2.add_node_from_struct(d_node);

        // 0: a, 1: b, 2: c, 3: d
        let a_b = Edge::new(a_idx, b_idx, 0.6);
        G2.add_edge_from_struct(a_b);

        let a_c = Edge::new(a_idx, c_idx, 0.33);
        G2.add_edge_from_struct(a_c);

        let b_d = Edge::new(b_idx, d_idx, 0.65);
        G2.add_edge_from_struct(b_d);

        let b_c = Edge::new(b_idx, c_idx, 0.11);
        G2.add_edge_from_struct(b_c);

        let graphs = vec![G1, G2];

        for graph in graphs {
            timeline.add_snapshot(graph);
        }
    }
}
