import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

import type { app_device_MeshDevice } from "@bindings/index";
import type { ConnectionType } from "@utils/connections";

export interface IDeviceState {
  device: app_device_MeshDevice | null;
  availableSerialPorts: string[] | null;
  primaryDeviceKey: string | null; // port or socket address
  primaryConnectionType: ConnectionType | null; // connection type for primary device
  autoConnectPort: string | null; // Port to automatically connect to on startup
}

export const initialDeviceState: IDeviceState = {
  device: null,
  availableSerialPorts: null,
  primaryDeviceKey: null,
  primaryConnectionType: null,
  autoConnectPort: null,
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

    setPrimaryDeviceConnection: (
      state,
      action: PayloadAction<{
        key: string;
        type: ConnectionType;
      } | null>,
    ) => {
      if (action.payload === null) {
        state.primaryDeviceKey = null;
        state.primaryConnectionType = null;
      } else {
        state.primaryDeviceKey = action.payload.key;
        state.primaryConnectionType = action.payload.type;
      }
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
