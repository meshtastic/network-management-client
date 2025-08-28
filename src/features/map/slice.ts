import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { ViewState } from "react-map-gl";

export interface IMapUIState {
  searchDockExpanded: boolean;
}

export interface IMapState {
  viewState: Partial<ViewState>;
  mapUIState: IMapUIState;
}

export const initialMapState: IMapState = {
  viewState: {
    latitude: 0.0,
    longitude: 0.0,
    zoom: 0.0,
  },
  mapUIState: {
    searchDockExpanded: true,
  },
};

export const mapSlice = createSlice({
  name: "map",
  initialState: initialMapState,
  reducers: {
    setViewState: (state, action: PayloadAction<IMapState["viewState"]>) => {
      state.viewState = action.payload;
    },
    setPosition: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>,
    ) => {
      state.viewState.latitude = action.payload.latitude;
      state.viewState.longitude = action.payload.longitude;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.viewState.zoom = action.payload;
    },
    setMapUIState: (state, action: PayloadAction<Partial<IMapUIState>>) => {
      state.mapUIState = { ...state.mapUIState, ...action.payload };
    },
  },
});

export const { actions: mapSliceActions, reducer: mapReducer } = mapSlice;
