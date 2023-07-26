import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TcpConnectionMeta = {
  address: string;
  port: number;
};

export interface IMapConfigState {
  style: string;
}

export type ColorMode = "light" | "dark" | "system";

export interface IGeneralConfigState {
  colorMode: ColorMode;
}

export interface IAppConfigState {
  lastTcpConnection: TcpConnectionMeta | null;
  map: IMapConfigState;
  general: IGeneralConfigState;
}

export const initialAppConfigState: IAppConfigState = {
  lastTcpConnection: null,
  map: {
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  general: {
    colorMode: "system",
  },
};

export const appConfigSlice = createSlice({
  name: "appConfig",
  initialState: initialAppConfigState,
  reducers: {
    setLastTcpConnection: (
      state,
      action: PayloadAction<TcpConnectionMeta | null>
    ) => {
      state.lastTcpConnection = action.payload;
    },
    setMapStyle: (state, action: PayloadAction<string>) => {
      state.map.style = action.payload;
    },
    setColorMode: (state, action: PayloadAction<ColorMode>) => {
      state.general.colorMode = action.payload;
    },
  },
});

export const { actions: appConfigSliceActions, reducer: appConfigReducer } =
  appConfigSlice;
