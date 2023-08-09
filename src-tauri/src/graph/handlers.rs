use std::time::Duration;

use log::{debug, error, trace};
use tauri::async_runtime;
use tokio_util::sync::CancellationToken;

use crate::state;

// Handlers

pub fn spawn_graph_node_timeout_handler(
    cancellation_token: CancellationToken,
    graph_arc: state::NetworkGraphInner,
) -> async_runtime::JoinHandle<()> {
    let handle = start_graph_node_timeout_handler(graph_arc);

    async_runtime::spawn(async move {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
              debug!("Graph timeout handler cancelled");
            }
            _ = handle => {
                error!("Graph timeout handler unexpectedly terminated");
            }
        }
    })
}

// Workers

async fn start_graph_node_timeout_handler(graph_arc: state::NetworkGraphInner) {
    trace!("Started graph timeout worker");

    loop {
        // Intermittently check graph for expired nodes
        tokio::time::sleep(Duration::from_secs(60)).await;

        // Scope to force drop of mutex guard
        {
            let mut graph_guard = graph_arc.lock().await;

            if let Some(_graph) = graph_guard.as_mut() {
                // let expired_nodes = graph.node_expirations.
                // let mut timeout_queue = &graph.node_timeout_queue;
                // let expired_node = timeout_queue.await;
            }
        }
    }
}
