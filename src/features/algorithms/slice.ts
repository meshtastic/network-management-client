import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface IAlgorithmsState {
  apResult: string[] | null;
  mincutResult: [string, string][] | null;
}

export const initialAlgorithmsState: IAlgorithmsState = {
  apResult: null,
  mincutResult: null,
};

export const algorithmsSlice = createSlice({
  name: "algorithms",
  initialState: initialAlgorithmsState,
  reducers: {
    setApResult: (state, action: PayloadAction<string[] | null>) => {
      state.apResult = action.payload;
    },
    setMincutResult: (
      state,
      action: PayloadAction<[string, string][] | null>,
    ) => {
      state.mincutResult = action.payload;
    },
  },
});

export const { actions: algorithmsSliceActions, reducer: algorithmsReducer } =
  algorithmsSlice;
