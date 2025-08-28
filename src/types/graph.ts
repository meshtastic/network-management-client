import type {
  app_graph_ds_edge_GraphEdge,
  app_graph_ds_node_GraphNode,
} from "@bindings/index";

export interface StableGraph {
  edge_property: "directed" | "undirected";
  edges: [number, number, app_graph_ds_edge_GraphEdge][]; // from, to, edge
  node_holes: unknown[];
  nodes: app_graph_ds_node_GraphNode[];
}

export interface MeshGraph {
  graph: StableGraph;
  nodesLookup: Record<number, app_graph_ds_node_GraphNode>;
}
