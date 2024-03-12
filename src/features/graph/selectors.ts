import { MeshGraph } from "@app/types/graph";
import { RootState } from "@store/index";

export const selectGraph =
  () =>
  (state: RootState): MeshGraph["graph"] | null =>
    state.graph.graph;
