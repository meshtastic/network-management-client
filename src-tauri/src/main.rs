mod algorithms;
mod aux_data_structures;
mod graph;
// Reference: https://rfdonnelly.github.io/posts/tauri-async-rust-process/
mod aux_functions;
use algorithms::articulation_point::articulation_point;
use app::protobufs::{NodeInfo, Position, User};
use aux_data_structures::neighbor_info::{Neighbor, NeighborInfo};
use aux_functions::graph_init::load_graph;
use petgraph::stable_graph::NodeIndex;

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
        .invoke_handler(tauri::generate_handler![js2rs, test_command])
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
fn test_command(nodes: Vec<NeighborInfo>) -> String {
    // Assemble a vector of nodes and their neighbors
    println!("{:?}", nodes);
    let mut graph = load_graph(nodes.clone());
    let articulation_points = articulation_point(graph.clone());
    let mut output = String::new();
    output.push_str("Output: ");
    for pt in articulation_points {
        println!("Articulation point: {:?}", pt);
        output.push_str(&graph.g.node_weight(pt).unwrap().name);
    }
    output

    // let mut nbr_info_vector = Vec::new();
    // let mut length = nodes.len();
    // for node in nodes.clone() {
    //     let nbr_info = NeighborInfo {
    //         user: node.user.unwrap(),
    //         position: node.position.unwrap(),
    //         snr: node.snr,
    //         num_neighbors: length as u32,
    //         neighbors: Vec::new(),
    //     };
    //     nbr_info_vector.push(nbr_info);
    // }
    // // Assume that all nodes have each other as neighbors; that is, that our graph is fully connected
    // for mut nbr in nbr_info_vector.clone() {
    //     for node_info in nodes.clone() {
    //         nbr.neighbors.push(Neighbor {
    //             user: node_info.user.unwrap(),
    //             position: node_info.position.unwrap(),
    //         });
    //     }
    // }
    // let mut graph = load_graph(nbr_info_vector.clone());
    // let articulation_points = articulation_point(graph.clone());
    // let mut output = String::new();
    // output.push_str("Output: ");
    // for pt in articulation_points {
    //     let node = graph.g.node_weight(pt).unwrap();
    //     output.push_str(&node.name);
    // }
    // output
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
