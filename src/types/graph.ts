import {
  app_graph_ds_edge_GraphEdge,
  app_graph_ds_node_GraphNode,
} from "@bindings/index";

export interface StableGraph {
  edge_property: "directed" | "undirected";
  edges: app_graph_ds_edge_GraphEdge[];
  node_holes: unknown[];
  nodes: app_graph_ds_node_GraphNode[];
}

export interface MeshGraph {
  graph: StableGraph;
}
