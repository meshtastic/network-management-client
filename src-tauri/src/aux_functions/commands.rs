use crate::algorithms::articulation_point::articulation_point;
use crate::algorithms::globalmincut::karger_stein_gmincut;
use crate::algorithms::stoer_wagner::stoer_wagner;
use crate::aux_data_structures::neighbor_info::NeighborInfo;
use crate::aux_data_structures::stoer_wagner_ds::StoerWagnerGraph;
use crate::aux_functions::graph_init::load_graph;

#[tauri::command]
pub fn run_articulation_point(nodes: Vec<NeighborInfo>) -> String {
    // Assemble a vector of nodes and their neighbors
    println!("Calculating articulation points with input: {:?}", nodes);
    let graph = load_graph(nodes.clone());
    let mut ap_size: usize = 0;
    let articulation_points = articulation_point(graph.clone());
    let mut output = String::new();
    for pt in articulation_points {
        println!("Articulation point: {:?}", pt);
        output.push_str(&graph.g.node_weight(pt).unwrap().name);
        ap_size += 1;
    }
    if ap_size == 0 {
        output.push_str("No Articulation Points Found");
    }
    output
}

#[tauri::command]
pub fn run_global_mincut(nodes: Vec<NeighborInfo>) -> f64 {
    println!("Calculating global mincut with input: {:?}", nodes);
    let graph = load_graph(nodes.clone());
    let order = graph.get_order();
    println!("Order: {}", order);
    let global_min_cut = karger_stein_gmincut(&graph.clone(), order as i32);
    println!("Global mincut: {}", global_min_cut);
    global_min_cut
}

#[tauri::command]
pub fn run_stoer_wagner(nodes: Vec<NeighborInfo>) -> String {
    println!("Calculating stoer wagner with input: {:?}", nodes);
    let graph = load_graph(nodes.clone());
    let graph_sw = &mut StoerWagnerGraph::new(graph.clone());
    let cut = stoer_wagner(&mut graph_sw.clone());
    match cut {
        Some(stoer_wagner) => {
            let output = format!(
                "Stoer-Wagner: {} {} {}",
                stoer_wagner.get_a(),
                stoer_wagner.get_b(),
                stoer_wagner.get_weight()
            );
            return output;
        }
        None => {
            let output = format!("Stoer-Wagner: No cut found");
            return output;
        }
    }
}
