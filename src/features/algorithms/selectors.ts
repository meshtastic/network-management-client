import type { RootState } from "@app/store";
import type { IAlgorithmsState } from "@features/algorithms/slice";

export const selectAlgorithmsResults =
  () =>
  (state: RootState): IAlgorithmsState =>
    state.algorithms;
