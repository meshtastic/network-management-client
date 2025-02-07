import type { MeshGraph } from "@app/types/graph";
import type { RootState } from "@store/index";

export const selectGraph =
  () =>
  (state: RootState): MeshGraph["graph"] | null =>
    state.graph.graph;
