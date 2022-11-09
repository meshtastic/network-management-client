mod algorithms;
mod aux_data_structures;
mod graph;
// Reference: https://rfdonnelly.github.io/posts/tauri-async-rust-process/

use tauri::Manager;
use tokio::sync::{mpsc, Mutex};
use tracing::info;
use tracing_subscriber;

struct AsyncProcInputTx {
    inner: Mutex<mpsc::Sender<String>>,
}

fn main() {
    tracing_subscriber::fmt::init();

    let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(1); // Inputs to async process (from JS, to worker thread)
    let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel(1); // Outputs from async process (from worker thread, to JS)

    tauri::Builder::default()
        .manage(AsyncProcInputTx {
            inner: Mutex::new(async_proc_input_tx),
        })
        .invoke_handler(tauri::generate_handler![js2rs, backend2front])
        .setup(|app| {
            tauri::async_runtime::spawn(async move {
                async_process_model(async_proc_input_rx, async_proc_output_tx).await
            });

            let app_handle_echo = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(output) = async_proc_output_rx.recv().await {
                        rs2js(output, &app_handle_echo);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn rs2js<R: tauri::Runtime>(message: String, manager: &impl Manager<R>) {
    info!(?message, "rs2js");
    manager
        .emit_all("rs2js", format!("rs: {}", message))
        .unwrap();
}

#[tauri::command]
async fn js2rs(message: String, state: tauri::State<'_, AsyncProcInputTx>) -> Result<(), String> {
    info!(?message, "js2rs");
    let async_proc_input_tx = state.inner.lock().await;

    async_proc_input_tx
        .send(message)
        .await
        .map_err(|e| e.to_string())
}

async fn async_process_model(
    mut input_rx: mpsc::Receiver<String>,
    output_tx: mpsc::Sender<String>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    while let Some(input) = input_rx.recv().await {
        let output = input;
        output_tx.send(output).await?;
    }

    Ok(())
}

#[tauri::command]
fn backend2front(data: String) -> String {
    let new_data = data + " sent from the backend";
    new_data
}

// #[tauri::command]
// pub fn run_articulation_point(data: Vec<NeighborInfo>) -> Vec<NodeIndex> {
//     let graph = load_graph(data);
//     let articulation_points = articulation_point(graph.clone());
//     articulation_points
// }

// #[tauri::command]
// pub fn run_global_mincut(data: Vec<NeighborInfo>) -> f64 {
//     let graph = load_graph(data);
//     let order = graph.get_order();
//     let global_min_cut = karger_stein_gmincut(&graph.clone(), order as i32);
//     global_min_cut
// }

// #[tauri::command]
// pub fn run_stoer_wagner(data: Vec<NeighborInfo>) -> Cut {
//     let graph = load_graph(data);
//     let graph_sw = &mut StoerWagnerGraph::new(graph.clone());
//     let stoer_wagner = stoer_wagner(&mut graph_sw.clone());
//     stoer_wagner
// }
