// A data structure to represent the timeline of graph snapshots.
use crate::aux_functions::handle_disc;
use crate::aux_functions::take_snapshot::take_snapshot_of_graph;
use crate::graph::graph_ds::Graph;
use postgres::{Client, NoTls};

// Created at the beginning of each rescue attempt.
pub struct Timeline {
    snapshots: Vec<Graph>,
    client: Client,
}

impl Timeline {
    pub fn new(link: &str) -> Timeline {
        Timeline {
            snapshots: Vec::new(),
            client: Client::connect(link, NoTls).unwrap(),
        }
    }

    pub fn add_snapshot(&mut self, snapshot: Graph) {
        // check if there is a disconnection
        if self.snapshots.len() > 0 {
            let last_snapshot = self.snapshots.last().unwrap();
            let is_connected = handle_disc::check_connection(last_snapshot, &snapshot);
            if !is_connected {
                // write the current timeline to database, then clear the timeline
                // and create another
                self.write();
                self.snapshots.clear();
                // change self to a new timeline
                self.snapshots.push(snapshot);
            } else {
                self.snapshots.push(snapshot);
            }
        }
    }

    pub fn get_snapshots(&self) -> Vec<Graph> {
        let mut snapshots = Vec::new();
        for snapshot in &self.snapshots {
            snapshots.push(snapshot.clone());
        }
        snapshots
    }

    pub fn get_snapshot(&self, idx: usize) -> Graph {
        self.snapshots[idx].clone()
    }

    pub fn get_snapshot_count(&self) -> usize {
        self.snapshots.len()
    }

    pub fn write(&mut self) {
        for snapshot in &self.snapshots {
            let snapshot_string = take_snapshot_of_graph(snapshot);
            let query = format!(
                "INSERT INTO snapshots (snapshot) VALUES ('{}')",
                snapshot_string
            );
            self.client.execute(query.as_str(), &[]).unwrap();
        }
    }

    pub fn clear(&mut self) {
        self.snapshots.clear();
    }
}
