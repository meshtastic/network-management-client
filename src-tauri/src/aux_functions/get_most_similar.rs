use super::convert_to_graph_from_string::convert_to_graph;
use super::take_snapshot::take_snapshot_of_graph;
use crate::graph::graph_ds::Graph;

use reqwest::Client;

use serde_json::json;

pub async fn get_most_similar(graphs: Vec<&Graph>) -> Result<String, String> {
    let client = Client::new();

    let mut snapshots = "".to_owned();
    for graph in graphs {
        let graph_string = take_snapshot_of_graph(graph);
        snapshots.push_str(&graph_string);
        snapshots.push_str("\n\n");
    }

    let snapshots_str: &str = &snapshots[..];

    let graph_json = json!({
      "snapshots": snapshots_str.clone(),
    });

    let res = client
        .post("http://127.0.0.1:5000/get_next_state")
        .json(&graph_json)
        .send()
        .await;

    if let Ok(res_json) = res {
        let graph_json = res_json.json::<serde_json::Value>().await;

        if let Ok(g_json) = graph_json {
            let next_statesnapshot = g_json["snapshot"].to_string().to_owned();

            let mut next_state_lines: Vec<&str> = next_statesnapshot.split("-").collect();

            let size = next_state_lines.len();
            next_state_lines[0] = &next_state_lines[0][1..]; // remove the first character
            next_state_lines[size - 1] = &next_state_lines[next_state_lines.len() - 1]
                [..next_state_lines[next_state_lines.len() - 1].len() - 1]; // remove the last character

            let graph = convert_to_graph(next_state_lines.clone());
            let graph_string = graph.to_string();

            println!("Next Graph State: \n{}", graph_string);
            Ok("Success".into())
        } else {
            Err("Error: could not convert graph_json to a string".into())
        }
    } else {
        Err("Error: could not get response from server".into())
    }
}

/* // test the function
#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::edge::Edge;
    use crate::graph::node::Node;

    #[test]
    fn test_api_call() {
        // Create a graph
        let mut G = Graph::new();

        // Create a few nodes and edges and add to graph
        let a: String = "a".to_string();
        let b: String = "b".to_string();
        let c: String = "c".to_string();
        let d: String = "d".to_string();

        let mut a_node = Node::new(a.clone());
        a_node.set_gps(-72.28486, 43.71489, 1.0);
        let a_idx = G.add_node_from_struct(a_node);

        let mut b_node = Node::new(b.clone());
        b_node.set_gps(-72.28239, 43.71584, 1.0);
        let b_idx = G.add_node_from_struct(b_node);

        let mut c_node = Node::new(c.clone());
        c_node.set_gps(-72.28332, 43.7114, 1.0);
        let c_idx = G.add_node_from_struct(c_node);

        let mut d_node = Node::new(d.clone());
        d_node.set_gps(-72.28085, 43.71235, 1.0);
        let d_idx = G.add_node_from_struct(d_node);

        // 0: a, 1: b, 2: c, 3: d
        let a_b = Edge::new(a_idx, b_idx, 0.51);
        G.add_edge_from_struct(a_b);

        let a_c = Edge::new(a_idx, c_idx, 0.39);
        G.add_edge_from_struct(a_c);

        let b_c = Edge::new(b_idx, c_idx, 0.4);
        G.add_edge_from_struct(b_c);

        let b_d = Edge::new(b_idx, d_idx, 0.6);
        G.add_edge_from_struct(b_d);

        let mut G2 = Graph::new();

        // Create a few nodes and edges and add to graph
        let a: String = "a".to_string();
        let b: String = "b".to_string();
        let c: String = "c".to_string();
        let d: String = "d".to_string();

        let mut a_node = Node::new(a.clone());
        a_node.set_gps(-72.28239, 43.71489, 1.0);
        let a_idx = G2.add_node_from_struct(a_node);

        let mut b_node = Node::new(b.clone());
        b_node.set_gps(-72.28486, 43.71584, 1.0);
        let b_idx = G2.add_node_from_struct(b_node);

        let mut c_node = Node::new(c.clone());
        c_node.set_gps(-72.28332, 43.7114, 1.0);
        let c_idx = G2.add_node_from_struct(c_node);

        let mut d_node = Node::new(d.clone());
        d_node.set_gps(-72.28085, 43.71235, 1.0);
        let d_idx = G2.add_node_from_struct(d_node);

        // 0: a, 1: b, 2: c, 3: d
        let a_b = Edge::new(a_idx, b_idx, 0.6);
        G2.add_edge_from_struct(a_b);

        let a_c = Edge::new(a_idx, c_idx, 0.33);
        G2.add_edge_from_struct(a_c);

        let b_d = Edge::new(b_idx, d_idx, 0.65);
        G2.add_edge_from_struct(b_d);

        let b_c = Edge::new(b_idx, c_idx, 0.11);
        G2.add_edge_from_struct(b_c);

        let graphs = vec![&G, &G2];

        let rt = tokio::runtime::Runtime::new().unwrap();

        // call get_most_similar and await the result

        let res = rt.block_on(get_most_similar(graphs));

        // handle res
        match res {
            Ok(graph) => {
                println!("Graph {:?}", graph);
            }
            Err(e) => {
                println!("error: {}", e);
            }
        }
    }
}
 */
