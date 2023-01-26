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
    setActionIdle: (state, action: PayloadAction<{ actionName: string }>) => {
      state.status[action.payload.actionName] = { status: "IDLE" };
    },
    setActionPending: (
      state,
      action: PayloadAction<{ actionName: string }>
    ) => {
      state.status[action.payload.actionName] = { status: "PENDING" };
    },
    setActionSuccessful: (
      state,
      action: PayloadAction<{ actionName: string }>
    ) => {
      state.status[action.payload.actionName] = { status: "SUCCESSFUL" };
    },
    setActionFailed: (
      state,
      action: PayloadAction<{ actionName: string; errorMessage: string }>
    ) => {
      state.status[action.payload.errorMessage] = {
        status: "FAILED",
        message: action.payload.errorMessage,
      };
    },
    clearActionState: (
      state,
      action: PayloadAction<{ actionName: string }>
    ) => {
      delete state.status[action.payload.actionName];
    },
  },
});

export const { actions: requestSliceActions, reducer: requestReducer } =
  requestSlice;
