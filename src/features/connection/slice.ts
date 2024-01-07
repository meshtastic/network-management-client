import type { RequestStatus } from "@features/requests/slice";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { DeviceKey } from "@utils/connections";

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
      action: PayloadAction<{ deviceKey: DeviceKey; status: RequestStatus }>,
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
