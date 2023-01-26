import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type IRequestState =
  | { status: "IDLE" }
  | { status: "PENDING" }
  | { status: "SUCCESSFUL" }
  | { status: "FAILED"; message: string };

export interface IRequestReducerState {
  status: Record<string, IRequestState>;
}

const InitialRequestState: IRequestReducerState = { status: {} };

export const requestSlice = createSlice({
  name: "request",
  initialState: InitialRequestState,
  reducers: {
    setRequestIdle: (state, action: PayloadAction<{ type: string }>) => {
      state.status[action.payload.type] = { status: "IDLE" };
    },
    setRequestPending: (state, action: PayloadAction<{ type: string }>) => {
      state.status[action.payload.type] = { status: "PENDING" };
    },
    setRequestSuccessful: (state, action: PayloadAction<{ type: string }>) => {
      state.status[action.payload.type] = { status: "SUCCESSFUL" };
    },
    setRequestFailed: (
      state,
      action: PayloadAction<{ type: string; message: string }>
    ) => {
      state.status[action.payload.message] = {
        status: "FAILED",
        message: action.payload.message,
      };
    },
    clearRequestState: (state, action: PayloadAction<{ type: string }>) => {
      delete state.status[action.payload.type];
    },
  },
});

export const { actions: requestSliceActions, reducer: requestReducer } =
  requestSlice;
