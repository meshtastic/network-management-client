// A data structure to represent the timeline of graph snapshots.
use postgres::{Client, NoTls};

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
        self.snapshots.push(snapshot);
    }

    pub fn get_snapshots(&self) -> Vec<Graph> {
        self.snapshots.clone()
    }

    pub fn get_snapshot(&self, idx: usize) -> Graph {
        self.snapshots[idx].clone()
    }

    pub fn get_snapshot_count(&self) -> usize {
        self.snapshots.len()
    }

    pub fn write(&self) {
        for snapshot in &self.snapshots {
            let snapshot_string = take_snapshot_of_graph(snapshot);
            let query = format!(
                "INSERT INTO snapshots (snapshot) VALUES ('{}')",
                snapshot_string
            );
            self.client.execute(query.as_str(), &[]).unwrap();
        }
    }
}
