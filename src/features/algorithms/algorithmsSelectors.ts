import type { RootState } from "@app/store";
import type { IAlgorithmsState } from "@features/algorithms/algorithmsSlice";

export const selectAlgorithmsResults =
  () => (state: RootState): IAlgorithmsState => state.algorithms;
