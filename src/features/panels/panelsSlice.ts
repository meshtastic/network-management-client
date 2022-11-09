import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ActiveSidebarPanel = "map" | "chat" | "info" | "settings" | "none";

export interface IPanelsSliceState {
  activeSidebarPanel: ActiveSidebarPanel;
}

export const initialPanelsState: IPanelsSliceState = {
  activeSidebarPanel: "none",
};

export const panelsSlice = createSlice({
  name: "sidebar",
  initialState: initialPanelsState,
  reducers: {
    setActiveSidebarPanel: (
      state,
      action: PayloadAction<ActiveSidebarPanel>
    ) => {
      state.activeSidebarPanel = action.payload;
    },
  },
});

export const { actions: panelsSliceActions, reducer: panelsReducer } =
  panelsSlice;
