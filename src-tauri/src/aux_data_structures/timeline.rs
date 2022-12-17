use std::collections::HashMap;

// A data structure to represent the timeline of graph snapshots.
use crate::aux_functions::take_snapshot::{take_snapshot_of_graph, take_snapshot_of_node_fts};
use crate::graph::graph_ds::Graph;
use postgres::{Client, NoTls};

// Created at the beginning of each rescue attempt.
pub struct Timeline {
    curr_snapshot: Option<Graph>,
    client: Client,
    label: i32,
    curr_timeline_id: i32,
    curr_snapshot_id: i32,
    training_table_name: String,
    timeline_ft_table_name: String,
}

impl Timeline {
    pub fn new(config_fields: HashMap<&str, &str>) -> Timeline {
        let mut config = postgres::Config::new();

        config
            .user(config_fields.get("user").unwrap())
            .password(config_fields.get("password").unwrap())
            .dbname(config_fields.get("dbname").unwrap())
            .host(config_fields.get("host").unwrap())
            .port(config_fields.get("port").unwrap().parse::<u16>().unwrap());

        let mut client = config.connect(NoTls).unwrap();
        let mut curr_timeline_id = 0;

        let create_training_table_query = format!(
            "CREATE TABLE IF NOT EXISTS {} (
                timeline_id INT,
                label INT
            )",
            config_fields.get("training_table_name").unwrap()
        );

        client.execute(&create_training_table_query, &[]).unwrap();

        let create_timeline_ft_table_query = format!(
            "CREATE TABLE IF NOT EXISTS {} (
                timeline_id integer,
                snapshot_id integer,
                node_fts_prim jsonb,
                snapshot_txt varchar,
                misc jsonb
            )",
            config_fields.get("ft_table_name").unwrap()
        );

        client
            .execute(&create_timeline_ft_table_query, &[])
            .unwrap();

        let max_timeline_id_query = format!(
            "SELECT MAX(timeline_id) FROM {}",
            config_fields.get("training_table_name").unwrap()
        );

        for row in client
            .query(&max_timeline_id_query, &[])
            .unwrap_or(Vec::new())
        {
            let timeline_id: i32 = row.get(0);
            curr_timeline_id = timeline_id + 1;
        }

        Timeline {
            curr_snapshot: None,
            client,
            label: 1,
            curr_timeline_id,
            curr_snapshot_id: 0,
            training_table_name: config_fields
                .get("training_table_name")
                .unwrap()
                .to_string(),
            timeline_ft_table_name: config_fields.get("ft_table_name").unwrap().to_string(),
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
                    self.label = 0;
                    let query = format!(
                        "INSERT INTO {} (timeline_id, label) VALUES ($1, $2)",
                        self.training_table_name
                    );
                    self.client
                        .execute(&query, &[&self.curr_timeline_id, &self.label])
                        .unwrap();
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

        let snapshot_id = self.curr_snapshot_id;
        let timeline_id = self.curr_timeline_id;

        let snapshot_of_node_fts = take_snapshot_of_node_fts(curr_snapshot);

        let snapshot_of_node_fts = serde_json::to_string(&snapshot_of_node_fts).unwrap();
        let snapshot_of_node_fts_json: serde_json::Value =
            serde_json::from_str(&snapshot_of_node_fts)
                .expect("Error converting snapshot_of_node_fts to serde_json::Value");

        let query_str =
            format!("INSERT INTO {} (timeline_id, snapshot_id, node_fts_prim, snapshot_txt, misc) VALUES ($1, $2, $3, $4, $5)", self.timeline_ft_table_name);

        // create empty serde_json value
        let empty_json = serde_json::Value::Object(serde_json::Map::new());

        self.client
            .execute(
                &query_str,
                &[
                    &timeline_id,
                    &snapshot_id,
                    &snapshot_of_node_fts_json,
                    &snapshot_string,
                    &empty_json,
                ],
            )
            .unwrap();
    }

    pub fn clear(&mut self) {
        self.curr_snapshot = None;
    }

    pub fn conclude_timeline(&mut self) {
        self.write();
        self.label = 1;
        let query = format!(
            "INSERT INTO {} (timeline_id, label) VALUES ($1, $2)",
            self.training_table_name
        );
        self.client
            .execute(&query, &[&self.curr_timeline_id, &self.label])
            .unwrap();
    }
}

#[cfg(test)]
mod tests {
    use crate::graph::{edge::Edge, node::Node};

    use super::*;

    #[test]
    fn test_timeline() {
        let mut config_fields = HashMap::new();

        config_fields.insert("user", "barkin");
        config_fields.insert("password", "zbRH6C32$f2N");
        config_fields.insert("dbname", "timelines1");
        config_fields.insert("host", "localhost");
        config_fields.insert("port", "5432");
        config_fields.insert("ft_table_name", "timelinestable2");
        config_fields.insert("training_table_name", "trainingtable2");

        let mut timeline = Timeline::new(config_fields);

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

        timeline.conclude_timeline();
    }
}
