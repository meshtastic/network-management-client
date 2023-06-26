import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RequestStatus } from "@features/requests/requestReducer";
import type  {DeviceKey } from "@features/device/deviceSagas";

export interface IConnectionState {
  connections: Record<DeviceKey, RequestStatus>;
}

export const initialConnectionState: IConnectionState = {
  connections: {},
};

export const connectionSlice = createSlice({
  name: "connection",
  initialState: initialConnectionState,
  reducers: {
    setConnectionState: (
      state,
      action: PayloadAction<{ deviceKey: DeviceKey; status: RequestStatus }>
    ) => {
      state.connections[action.payload.deviceKey] = action.payload.status;
    },
    clearAllConnectionState: (state) => {
      state.connections = {};
    },
  },
});

export const { actions: connectionSliceActions, reducer: connectionReducer } =
  connectionSlice;
