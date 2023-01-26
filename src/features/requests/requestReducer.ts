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
    setActionIdle: (state, action: PayloadAction<{ type: string }>) => {
      state.status[action.payload.type] = { status: "IDLE" };
    },
    setActionPending: (state, action: PayloadAction<{ type: string }>) => {
      state.status[action.payload.type] = { status: "PENDING" };
    },
    setActionSuccessful: (state, action: PayloadAction<{ type: string }>) => {
      state.status[action.payload.type] = { status: "SUCCESSFUL" };
    },
    setActionFailed: (
      state,
      action: PayloadAction<{ type: string; message: string }>
    ) => {
      state.status[action.payload.message] = {
        status: "FAILED",
        message: action.payload.message,
      };
    },
    clearActionState: (state, action: PayloadAction<{ type: string }>) => {
      delete state.status[action.payload.type];
    },
  },
});

export const { actions: requestSliceActions, reducer: requestReducer } =
  requestSlice;
