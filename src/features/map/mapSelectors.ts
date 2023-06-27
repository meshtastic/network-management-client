import type { RootState } from "@app/store";
import type { IMapState, IMapUIState } from "@features/map/mapSlice";

export const selectMapState =
  () =>
  (state: RootState): IMapState =>
    state.map;

export const selectMapUIState =
  () =>
  (state: RootState): IMapUIState =>
    state.map.mapUIState;
