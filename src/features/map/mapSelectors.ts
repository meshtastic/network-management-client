import type { RootState } from "@app/store";
import type { IMapState } from "@features/map/mapSlice";

export const selectMapState =
  () =>
  (state: RootState): IMapState =>
    state.map;
