use crate::graph::edge::Edge;
use petgraph::graph::NodeIndex;

pub fn edge_factory(
    a: Vec<NodeIndex>,
    b: Vec<NodeIndex>,
    distance: Vec<f64>,
    radio_s_quality: Vec<f64>,
) -> Vec<Edge> {
    let distance_min = distance.iter().fold(f64::INFINITY, |acc, &x| acc.min(x));
    let distance_max = distance
        .iter()
        .fold(f64::NEG_INFINITY, |acc, &x| acc.max(x));
    let radio_s_quality_min = radio_s_quality
        .iter()
        .fold(f64::INFINITY, |acc, &x| acc.min(x));
    let radio_s_quality_max = radio_s_quality
        .iter()
        .fold(f64::NEG_INFINITY, |acc, &x| acc.max(x));

    // create a vector of edges
    let mut edges: Vec<Edge> = Vec::new();

    for i in 0..a.len() {
        let a = a[i].clone();
        let b = b[i].clone();
        let distance = distance[i];
        let radio_s_quality = radio_s_quality[i];

        // normalize the values
        let weight = normalize_weight(
            distance,
            (distance_min, distance_max),
            radio_s_quality,
            (radio_s_quality_min, radio_s_quality_max),
        );

        // create an edge
        let edge = Edge::new(a, b, weight);

        // add the edge to the vector
        edges.push(edge);
    }

    return edges;
}

pub fn normalize_weight(
    distance: f64,
    distance_minmax: (f64, f64),
    radio_s_quality: f64,
    radio_s_quality_minmax: (f64, f64),
) -> f64 {
    let distance_norm = (distance - distance_minmax.0) / (distance_minmax.1 - distance_minmax.0);
    let radio_s_quality_norm = (radio_s_quality - radio_s_quality_minmax.0)
        / (radio_s_quality_minmax.1 - radio_s_quality_minmax.0);
    let weight = (0.5 * distance_norm) + (0.5 * radio_s_quality_norm);
    return weight;
}

// Create a unit test for the Graph struct
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_edge_factory() {
        let u = NodeIndex::new(0);
        let v = NodeIndex::new(1);
        let w = NodeIndex::new(2);
        let x = NodeIndex::new(3);

        let a = vec![u.clone(), u.clone(), w.clone(), v.clone()];
        let b = vec![v.clone(), w.clone(), x.clone(), x.clone()];

        let distance = vec![0.45, 0.67, 0.23, 1.2];
        let radio_s_quality = vec![5.5, 3.12, 10.3, 2.7];

        let edges = edge_factory(a, b, distance, radio_s_quality);

        for edge in edges {
            assert!(edge.weight != 0.0);
            println!("{:?}", edge);
        }
    }
}
