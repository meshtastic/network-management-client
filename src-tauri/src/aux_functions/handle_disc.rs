// Each time we take a snapshot, we want to check if there is a disconnection
// using the following formula: if abs(|V_i| - |V_(i + 1)|) >= 1
// If the formula evaluates to true, then we have a disconnection
// otherwise, we do not have a disconnection

use crate::graph::graph_ds::Graph;

fn check_connection(g1: &Graph, g2: &Graph) -> bool {
    let v1 = g1.get_vertices();
    let v2 = g2.get_vertices();

    let v1_size = v1.len();
    let v2_size = v2.len();

    let diff = (v1_size as i32 - v2_size as i32).abs();

    if diff >= 1 {
        return false;
    }

    true
}
