// A data structure to represent the timeline of graph snapshots.
use crate::aux_functions::handle_disc;
use crate::aux_functions::take_snapshot::take_snapshot_of_graph;
use crate::graph::graph_ds::Graph;
use postgres::{Client, NoTls};

// Created at the beginning of each rescue attempt.
pub struct Timeline {
    curr_snapshot: Option<Graph>,
    client: Client,
    curr_timeline_id: i32,
}

impl Timeline {
    pub fn new(link: &str) -> Timeline {
        // connect to the database and get the id of latest timeline
        let mut client = Client::connect(link, NoTls).unwrap();
        let mut curr_timeline_id = 0;

        for row in client
            .query("SELECT MAX(timeline_id) FROM timelines_1", &[])
            .unwrap_or(Vec::new())
        {
            let timeline_id: i32 = row.get(0);
            curr_timeline_id = timeline_id + 1;
        }

        Timeline {
            curr_snapshot: None,
            client,
            curr_timeline_id,
        }
    }

    pub fn add_snapshot(&mut self, snapshot: Graph) {
        match &self.curr_snapshot {
            None => {
                self.curr_snapshot = Some(snapshot);
            }
            Some(curr_snapshot) => {
                let is_connected = handle_disc::check_connection(&curr_snapshot, &snapshot);
                if !is_connected {
                    self.write();
                    self.curr_snapshot = Some(snapshot);
                } else {
                    self.curr_snapshot = Some(snapshot);
                }
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
        let snapshot_string = take_snapshot_of_graph(&curr_snapshot);
        let query = format!(
            "INSERT INTO snapshots (snapshot) VALUES ('{}')",
            snapshot_string
        );
        self.client.execute(query.as_str(), &[]).unwrap();
    }

    pub fn clear(&mut self) {
        self.curr_snapshot = None;
    }
}
