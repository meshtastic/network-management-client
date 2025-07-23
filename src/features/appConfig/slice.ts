import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

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
  about: null;
}

export const initialAppConfigState: IAppConfigState = {
  // This is not intended to be manually updated by the user
  // Might be worth adding a new "hidden" object
  lastTcpConnection: null,

  map: {
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  general: {
    colorMode: "system",
  },
  about: null
};

export const appConfigSlice = createSlice({
  name: "appConfig",
  initialState: initialAppConfigState,
  reducers: {
    setLastTcpConnection: (
      state,
      action: PayloadAction<TcpConnectionMeta | null>,
    ) => {
      state.lastTcpConnection = action.payload;
    },
    updateGeneralConfig: (
      state,
      action: PayloadAction<Partial<IGeneralConfigState>>,
    ) => {
      state.general = { ...state.general, ...action.payload };
    },
    updateMapConfig: (
      state,
      action: PayloadAction<Partial<IMapConfigState>>,
    ) => {
      state.map = { ...state.map, ...action.payload };
    },
  },
});

export const { actions: appConfigSliceActions, reducer: appConfigReducer } =
  appConfigSlice;
