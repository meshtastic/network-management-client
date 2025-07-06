import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

import type { app_device_MeshDevice } from "@bindings/index";

export interface IDeviceState {
  device: app_device_MeshDevice | null;
  availableSerialPorts: string[] | null;
  primaryDeviceKey: string | null; // port or socket ddress
  autoConnectPort: string | null; // Port to automatically connect to on startup
  autoConnectBluetooth: string | null;
}

export const initialDeviceState: IDeviceState = {
  device: null,
  availableSerialPorts: null,
  primaryDeviceKey: null,
  autoConnectPort: null,
  autoConnectBluetooth: null
};

export const deviceSlice = createSlice({
  name: "device",
  initialState: initialDeviceState,
  reducers: {
    setAvailableSerialPorts: (
      state,
      action: PayloadAction<string[] | null>,
    ) => {
      state.availableSerialPorts = action.payload;
    },

    setPrimaryDeviceConnectionKey: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.primaryDeviceKey = action.payload;
    },

    setDevice: (state, action: PayloadAction<app_device_MeshDevice | null>) => {
      state.device = action.payload;
    },

    setAutoConnectPort: (state, action: PayloadAction<string | null>) => {
      state.autoConnectPort = action.payload;
    },
  },
});

export const { actions: deviceSliceActions, reducer: deviceReducer } =
  deviceSlice;
