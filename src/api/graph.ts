import { invoke } from "@tauri-apps/api";
import { MeshGraph } from "@app/types/graph";

export const fetchGraph = async () => {
  const response = (await invoke("get_graph_state", {})) as MeshGraph;

  return response;
};
