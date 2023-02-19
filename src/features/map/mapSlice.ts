import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IMapState {
  latitude: number;
  longitude: number;
  zoom: number;
}

export const initialMapState: IMapState = {
  latitude: 0.0,
  longitude: 0.0,
  zoom: 0.0,
};

export const mapSlice = createSlice({
  name: "map",
  initialState: initialMapState,
  reducers: {
    setPosition: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>
    ) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
  },
});

export const { actions: mapSliceActions, reducer: mapReducer } = mapSlice;
