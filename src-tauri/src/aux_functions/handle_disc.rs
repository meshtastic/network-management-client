// Each time we take a snapshot, we want to check if there is a disconnection
// using the following formula: if abs(|V_i| - |V_(i + 1)|) >= 1
// If the formula evaluates to true, then we have a disconnection
// otherwise, we do not have a disconnection

use crate::graph::graph_ds::Graph;

pub fn check_connection(g1: &Graph, g2: &Graph) -> bool {
    let g1_order = g1.get_order();
    let g2_order = g2.get_order();

    let diff = (g1_order as i32 - g2_order as i32).abs();

    if diff >= 1 {
        return false;
    }

    true
}
