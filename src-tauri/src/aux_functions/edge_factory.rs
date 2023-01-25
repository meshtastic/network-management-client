use crate::graph::edge::Edge;
use petgraph::graph::NodeIndex;

/// Returns a list of edges
///
/// # Arguments
///
/// * `a` - List of first endpoints of edges
/// * `b` - List of second endpoints of edges
/// * `distances` - List of distances between nodes
/// * `radio_s_quality` - List of radio signal qualities between nodes
/// * `distance_weight` - Weight of distance in edge weight
/// * `radio_s_quality_weight` - Weight of radio signal quality in edge weight
///
/// a, b, distance and radio_s_quality must have the same length and provide
/// one-to-one mapping.
pub fn edge_factory(
    a: Vec<NodeIndex>,
    b: Vec<NodeIndex>,
    distance: Vec<f64>,
    radio_s_quality: Vec<f64>,
    distance_weight: Option<f64>,
    radio_s_quality_weight: Option<f64>,
) -> Vec<Edge> {
    let mut scaled_distances: Vec<f64> = Vec::new();

    for dist in distance {
        let scaled_dist = scale_distance(dist);
        scaled_distances.push(scaled_dist);
    }

    let distance_min = scaled_distances
        .iter()
        .fold(f64::INFINITY, |acc, &x| acc.min(x));
    let distance_max = scaled_distances
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

    // unwrap the weights
    let distance_weight = distance_weight.unwrap_or(0.5);
    let radio_s_quality_weight = radio_s_quality_weight.unwrap_or(0.5);

    for i in 0..a.len() {
        let a = a[i].clone();
        let b = b[i].clone();
        let distance = scaled_distances[i];
        let radio_s_quality = radio_s_quality[i];

        // normalize the values
        let weight = normalize_weight(
            distance,
            (distance_min, distance_max),
            distance_weight,
            radio_s_quality,
            (radio_s_quality_min, radio_s_quality_max),
            radio_s_quality_weight,
        );

        let edge = Edge::new(a, b, weight);

        edges.push(edge);
    }

    return edges;
}

pub fn scale_distance(distance: f64) -> f64 {
    return 1.0 / (1.0 + distance).ln();
}

pub fn normalize_weight(
    distance: f64,
    distance_minmax: (f64, f64),
    distance_weight: f64,
    radio_s_quality: f64,
    radio_s_quality_minmax: (f64, f64),
    radio_s_quality_weight: f64,
) -> f64 {
    let e = f64::EPSILON;

    let distance_norm =
        (distance - distance_minmax.0 + e) / (distance_minmax.1 - distance_minmax.0 + e);
    let radio_s_quality_norm = (radio_s_quality - radio_s_quality_minmax.0 + e)
        / (radio_s_quality_minmax.1 + e - radio_s_quality_minmax.0);
    let weight =
        (distance_weight * distance_norm) + (radio_s_quality_weight * radio_s_quality_norm);
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

        let edges = edge_factory(a, b, distance, radio_s_quality, None, None);

        for edge in edges {
            assert!(edge.weight >= 0.0 && edge.weight <= 1.1);
        }
    }
}
