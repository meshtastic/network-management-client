import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RequestStatus =
  | { status: "IDLE" }
  | { status: "PENDING" }
  | { status: "SUCCESSFUL" }
  | { status: "FAILED"; message: string };

export interface IRequestReducerState {
  status: Record<string, RequestStatus>;
}

const InitialRequestState: IRequestReducerState = { status: {} };

export const requestSlice = createSlice({
  name: "request",
  initialState: InitialRequestState,
  reducers: {
    setRequestIdle: (state, action: PayloadAction<{ name: string }>) => {
      state.status[action.payload.name] = { status: "IDLE" };
    },
    setRequestPending: (state, action: PayloadAction<{ name: string }>) => {
      state.status[action.payload.name] = { status: "PENDING" };
    },
    setRequestSuccessful: (state, action: PayloadAction<{ name: string }>) => {
      state.status[action.payload.name] = { status: "SUCCESSFUL" };
    },
    setRequestFailed: (
      state,
      action: PayloadAction<{ name: string; message: string }>,
    ) => {
      state.status[action.payload.name] = {
        status: "FAILED",
        message: action.payload.message,
      };
    },
    clearRequestState: (state, action: PayloadAction<{ name: string }>) => {
      delete state.status[action.payload.name];
    },
  },
});

export const { actions: requestSliceActions, reducer: requestReducer } =
  requestSlice;
