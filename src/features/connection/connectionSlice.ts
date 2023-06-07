import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RequestStatus } from "@features/requests/requestReducer";

export interface IConnectionState {
  connections: Record<string, RequestStatus>; // portName to state
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
      action: PayloadAction<{ identifier: string; status: RequestStatus }>
    ) => {
      state.connections[action.payload.identifier] = action.payload.status;
    },
    clearAllConnectionState: (state) => {
      state.connections = {};
    },
  },
});

export const { actions: connectionSliceActions, reducer: connectionReducer } =
  connectionSlice;
