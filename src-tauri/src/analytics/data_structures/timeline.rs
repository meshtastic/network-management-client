#![allow(dead_code)]

use log::error;
use std::collections::HashMap;
use std::fs;
use std::fs::OpenOptions;
use std::io::prelude::*;

// A data structure to represent the timeline of graph snapshots.
use crate::analytics::aux_functions::take_snapshot::take_snapshot_of_graph;
use crate::graph::graph_ds::Graph;

// Created at the beginning of each rescue attempt.
pub struct NetworkTimeline {
    curr_snapshot: Option<Graph>,
    label: i32,
    curr_timeline_id: i32,
    curr_snapshot_id: i32,
    label_dir: String,
    data_dir: String,
    save: bool,
}

impl NetworkTimeline {
    /// Creates a new timeline.
    ///
    /// # Arguments
    ///
    /// * `config_fields` - a HashMap containing the config fields: timeline_data_dir (location of data/timelines) and timeline_label_dir (location of data)
    /// * `is_save` - a boolean indicating whether the timeline should be saved or not
    ///
    /// # Returns
    ///
    /// * `Timeline` - a new timeline
    pub fn new(config_fields: HashMap<&str, &str>, is_save: bool) -> NetworkTimeline {
        let mut curr_timeline_id = 0;

        let timeline_data_dir = config_fields.get("timeline_data_dir").unwrap_or(&"");
        let timeline_label_dir = config_fields.get("timeline_label_dir").unwrap_or(&"");

        if is_save {
            let paths = fs::read_dir(timeline_data_dir).unwrap();
            for res_path in paths {
                let path = res_path.unwrap().path();
                let filename = path.file_name().unwrap().to_str().unwrap();
                let filename = filename.split('.').collect::<Vec<&str>>()[0];
                let prev_timeline_id = filename.parse::<i32>().unwrap();
                if prev_timeline_id > curr_timeline_id {
                    curr_timeline_id = prev_timeline_id;
                };
            }
        }

        curr_timeline_id += 1;

        NetworkTimeline {
            curr_snapshot: None,
            label: 1,
            curr_timeline_id,
            curr_snapshot_id: 0,
            label_dir: timeline_label_dir.to_string(),
            data_dir: timeline_data_dir.to_string(),
            save: is_save,
        }
    }

    pub fn add_snapshot(&mut self, snapshot: &Graph) {
        match &self.curr_snapshot {
            None => {
                self.curr_snapshot = Some(snapshot.clone());
            }
            Some(_curr_snapshot) => {
                let is_connected = self.check_connection(snapshot);
                if self.save {
                    self.write_snapshot();
                }
                self.curr_snapshot = Some(snapshot.clone());
                if !is_connected {
                    self.label = 0;
                    if self.save {
                        self.write_timeline_label();
                    }
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

    pub fn get_curr_snapshot(&self) -> Option<&Graph> {
        self.curr_snapshot.as_ref()
    }

    /// Writes the current snapshot to a txt file.
    pub fn write_snapshot(&mut self) {
        let curr_snapshot = self.curr_snapshot.as_ref().expect("msg");
        let mut snapshot_string = take_snapshot_of_graph(curr_snapshot);
        snapshot_string.push('\n');

        let timeline_id = self.curr_timeline_id;

        let filename = format!("{}/{}.txt", self.data_dir, timeline_id);
        let mut file = OpenOptions::new()
            .append(true)
            .create(true)
            .open(filename.clone())
            .unwrap();

        if let Err(e) = writeln!(file, "{}", snapshot_string) {
            error!("Couldn't write snapshot to file {}: {}", filename, e);
        }
    }

    /// Writes the current label to a txt file.
    pub fn write_timeline_label(&mut self) {
        let label_text = format!("{},{}", self.curr_timeline_id, self.label);
        let filename = format!("{}/labels.txt", self.label_dir);

        let mut labels_file = OpenOptions::new()
            .append(true)
            .create(true)
            .open(filename.clone())
            .unwrap();

        if let Err(e) = writeln!(labels_file, "{}", label_text) {
            error!("Couldn't write label to file {}: {}", filename, e);
        }
    }

    pub fn clear(&mut self) {
        self.curr_snapshot = None;
    }

    pub fn conclude_timeline(&mut self) {
        if self.save {
            self.write_snapshot();
            self.label = 1;
            self.write_timeline_label();
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::graph::{edge::Edge, node::Node};

    use super::*;

    #[test]
    fn test_timeline() {
        let mut config_fields = HashMap::new();

        config_fields.insert("timeline_data_dir", "data/timelines");
        config_fields.insert("timeline_label_dir", "data");

        let mut timeline = NetworkTimeline::new(config_fields, false);

        let mut graph1 = Graph::new();

        // Create a few nodes and edges and add to graph
        let a: String = "a".to_string();
        let b: String = "b".to_string();
        let c: String = "c".to_string();
        let d: String = "d".to_string();

        let mut a_node = Node::new(a);
        a_node.set_gps(-72.28486, 43.71489, 1.0);
        let a_idx = graph1.add_node_from_struct(a_node);

        let mut b_node = Node::new(b);
        b_node.set_gps(-72.28239, 43.71584, 1.0);
        let b_idx = graph1.add_node_from_struct(b_node);

        let mut c_node = Node::new(c);
        c_node.set_gps(-72.28332, 43.7114, 1.0);
        let c_idx = graph1.add_node_from_struct(c_node);

        let mut d_node = Node::new(d);
        d_node.set_gps(-72.28085, 43.71235, 1.0);
        let d_idx = graph1.add_node_from_struct(d_node);

        // 0: a, 1: b, 2: c, 3: d
        let a_b = Edge::new(a_idx, b_idx, 0.51);
        graph1.add_edge_from_struct(a_b);

        let a_c = Edge::new(a_idx, c_idx, 0.39);
        graph1.add_edge_from_struct(a_c);

        let b_c = Edge::new(b_idx, c_idx, 0.4);
        graph1.add_edge_from_struct(b_c);

        let b_d = Edge::new(b_idx, d_idx, 0.6);
        graph1.add_edge_from_struct(b_d);

        let mut graph2 = Graph::new();

        // Create a few nodes and edges and add to graph
        let a: String = "a".to_string();
        let b: String = "b".to_string();
        let c: String = "c".to_string();
        let d: String = "d".to_string();

        let mut a_node = Node::new(a);
        a_node.set_gps(-72.28239, 43.71489, 1.0);
        let a_idx = graph2.add_node_from_struct(a_node);

        let mut b_node = Node::new(b);
        b_node.set_gps(-72.28486, 43.71584, 1.0);
        let b_idx = graph2.add_node_from_struct(b_node);

        let mut c_node = Node::new(c);
        c_node.set_gps(-72.28332, 43.7114, 1.0);
        let c_idx = graph2.add_node_from_struct(c_node);

        let mut d_node = Node::new(d);
        d_node.set_gps(-72.28085, 43.71235, 1.0);
        let d_idx = graph2.add_node_from_struct(d_node);

        // 0: a, 1: b, 2: c, 3: d
        let a_b = Edge::new(a_idx, b_idx, 0.6);
        graph2.add_edge_from_struct(a_b);

        let a_c = Edge::new(a_idx, c_idx, 0.33);
        graph2.add_edge_from_struct(a_c);

        let b_d = Edge::new(b_idx, d_idx, 0.65);
        graph2.add_edge_from_struct(b_d);

        let b_c = Edge::new(b_idx, c_idx, 0.11);
        graph2.add_edge_from_struct(b_c);

        let graphs = vec![graph1, graph2];

        for graph in graphs {
            timeline.add_snapshot(&graph);
        }

        timeline.conclude_timeline();
    }
}
