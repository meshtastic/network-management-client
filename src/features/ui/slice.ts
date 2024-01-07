import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type {
  app_device_MeshNode,
  app_device_NormalizedWaypoint,
} from "@bindings/index";

export interface IUiState {
  activeNode: app_device_MeshNode["nodeNum"] | null;
  activeWaypoint: app_device_NormalizedWaypoint["id"] | null;
  infoPane: "waypoint" | "algos" | null;
}

export const initialUiState: IUiState = {
  activeNode: null,
  activeWaypoint: null,
  infoPane: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState: initialUiState,
  reducers: {
    setActiveNode: (
      state,
      action: PayloadAction<app_device_MeshNode["nodeNum"] | null>,
    ) => {
      state.activeNode = action.payload;

      if (action.payload) {
        // If whatever is passed in when this is called is not null
        state.activeWaypoint = null;
        state.infoPane = null;
      }
    },

    setActiveWaypoint: (
      state,
      action: PayloadAction<app_device_NormalizedWaypoint["id"] | null>,
    ) => {
      state.activeWaypoint = action.payload;

      if (action.payload) {
        // If there is an active waypoint then we don't want another info screen
        state.infoPane = "waypoint";
        state.activeNode = null;
      }
    },

    setInfoPane: (
      state,
      action: PayloadAction<"waypoint" | "algos" | null>,
    ) => {
      state.infoPane = action.payload;

      if (action.payload) {
        state.activeNode = null;
      } else {
        state.activeWaypoint = null;
      }
    },
  },
});

export const { actions: uiSliceActions, reducer: uiReducer } = uiSlice;
