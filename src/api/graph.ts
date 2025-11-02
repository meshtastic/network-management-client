import { invoke } from "@tauri-apps/api/core";
import type { MeshGraph } from "@app/types/graph";

export const fetchGraph = async () => {
  const response = (await invoke("get_graph_state", {
    request: {},
  })) as { graph: MeshGraph };

  return response.graph;
};

export const initializeTimeoutHandler = async () => {
  const response = (await invoke("initialize_timeout_handler", {
    request: {},
  })) as undefined;

  return response;
};

export const stopTimeoutHandler = async () => {
  const response = (await invoke("stop_timeout_handler", {
    request: {},
  })) as undefined;

  return response;
};
