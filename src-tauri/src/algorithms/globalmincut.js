function bisect_left(a, x, lo = 0, hi) {
    if (lo < 0) {
        throw new Error('lo must be non-negative');
    }
    if (hi == null) {
        hi = a.length;
    }
    while (lo < hi) {
        var mid = Math.floor((lo + hi) / 2);
        if (a[mid] < x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

/*
   random_select(G)
   Choose a first endpoint u with probability proportional to D(u), and then once u
   is fixed choose a second endpoint v with probability proportional to W(u, v).
*/
function random_select(G) {
    const r = Math.random() * G.get_total_weight();
    
    var i = bisect_left(G.get_cumulative_edge_weights(), r);
    return G.get_edges()[i];
}

function contract_edge(G, edge) {
    const new_value = G.get_optimal_weighted_degree(edge[0]) + G.get_optimal_weighted_degree(edge[1]) - 2 * G.get_edge_weight(edge);
    G.set_optimal_weighted_degree(edge[0], new_value);

    G.set_optimal_weighted_degree(edge[1], 0);
    G.set_edge_weight(edge[0], edge[1], 0);
    G.set_edge_weight(edge[1], edge[0], 0);

    for (var node in G.get_nodes()) {
        if (node != edge[0] && node != edge[1]) {
            // edge = (u, v)
            G.set_edge_weight((edge[0], node), G.get_edge_weight(edge[0], node) + G.get_edge_weight(edge[1], node));
            G.set_edge_weight((node, edge[0]), G.get_edge_weight(node, edge[0]) + G.get_edge_weight(node, edge[1]));
            G.set_edge_weight((edge[1], node), 0);
            G.set_edge_weight((node, edge[1]), 0);
        }

    }
}

function contract(G, k) {
    var g_prime = G.copy();
    var n = g_prime.order();
    while (g_prime.order() > n - k) {
        var e = random_select(g_prime);
        contract_edge(g_prime, e);
        g_prime.remove_edge(e);
    }
    return g_prime;
}

function karger_stein_gmincut(G) {
    var n = G.order();
    if (n <= 6) {
        g_prime = contract(G, 2);
        // return the weight of cut (A = s(a), B = s(b)) in g_prime
        return g_prime.get_subset_weight_sum(g_prime.get_nodes());
    } else {
        g_prime_1 = contract(G, Math.ceil(n / Math.sqrt(2) + 1));
        g_prime_2 = contract(G, Math.ceil(n / Math.sqrt(2) + 1));
        return min(karger_stein_gmincut(g_prime_1), karger_stein_gmincut(g_prime_2));
    }
}