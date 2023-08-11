use std::time::Duration;

use log::{debug, error, trace};
use tauri::async_runtime;
use tokio_util::sync::CancellationToken;

use crate::state::NetworkGraphInner;

pub fn spawn_graph_update_handler(
    graph_arc: NetworkGraphInner,
    cancellation_token: CancellationToken,
) -> async_runtime::JoinHandle<()> {
    let handle = start_graph_update_worker(graph_arc);

    async_runtime::spawn(async move {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
              debug!("Graph update handler cancelled");
            }
            _ = handle => {
                error!("Graph update handler unexpectedly terminated");
            }
        }
    })
}

async fn start_graph_update_worker(graph_arc: NetworkGraphInner) {
    trace!("Started graph update worker");

    loop {
        tokio::time::sleep(Duration::from_secs(60)).await;

        {
            let mut graph_option = graph_arc.lock().await;
            let graph = match graph_option.as_mut() {
                Some(graph) => graph,
                None => continue,
            };

            graph.purge_graph_timeout_buffers();
        }
    }
}
