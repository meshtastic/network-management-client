import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MeshDevice } from "@bindings/MeshDevice";
import type { MeshNode } from "@bindings/MeshNode";

export interface IDeviceState {
  device: MeshDevice | null;
  activeNode: MeshNode["data"]["num"] | null;
}

export const initialDeviceState: IDeviceState = {
  device: null,
  activeNode: null,
};

/* eslint-disable no-param-reassign */
export const deviceSlice = createSlice({
  name: "device",
  initialState: initialDeviceState,
  reducers: {
    setDevice: (state, action: PayloadAction<MeshDevice | null>) => {
      state.device = action.payload;
    },
    setActiveNode: (
      state,
      action: PayloadAction<MeshNode["data"]["num"] | null>
    ) => {
      state.activeNode = action.payload;
    },
  },
});
/* eslint-enable no-param-reassign */

export const { actions: deviceSliceActions, reducer: deviceReducer } =
  deviceSlice;
