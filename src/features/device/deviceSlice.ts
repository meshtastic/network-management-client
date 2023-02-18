import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MeshDevice } from "@bindings/MeshDevice";
import type { MeshNode } from "@bindings/MeshNode";

export interface IDeviceState {
  device: MeshDevice | null;
  activeNode: MeshNode["data"]["num"] | null;
  availableSerialPorts: string[] | null;
  activeSerialPort: string | null;
}

export const initialDeviceState: IDeviceState = {
  device: null,
  activeNode: null,
  availableSerialPorts: null,
  activeSerialPort: null,
};

export const deviceSlice = createSlice({
  name: "device",
  initialState: initialDeviceState,
  reducers: {
    setAvailableSerialPorts: (
      state,
      action: PayloadAction<string[] | null>
    ) => {
      state.availableSerialPorts = action.payload;
    },
    setActiveSerialPort: (state, action: PayloadAction<string | null>) => {
      state.activeSerialPort = action.payload;
    },
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

export const { actions: deviceSliceActions, reducer: deviceReducer } =
  deviceSlice;
