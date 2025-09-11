import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export type TcpConnectionMeta = {
  address: string;
  port: number;
};

export type RecentConnection = {
  id: string; // Unique identifier for the connection
  address: string; // IP:port
  lastConnected: number;
  firstConnected: number;
  // Device info (populated after successful connection)
  deviceName?: string;
  shortName?: string;
  longName?: string;
};

export interface IMapConfigState {
  style: string;
}

export type ColorMode = "light" | "dark" | "system";

export interface IGeneralConfigState {
  colorMode: ColorMode;
  selectedConnectionTab?: "SERIAL" | "TCP";
}

export interface IAppConfigState {
  lastTcpConnection: TcpConnectionMeta | null;
  recentConnections: RecentConnection[];
  map: IMapConfigState;
  general: IGeneralConfigState;
  about: null;
}

export const initialAppConfigState: IAppConfigState = {
  // This is not intended to be manually updated by the user
  // Might be worth adding a new "hidden" object
  lastTcpConnection: null,
  recentConnections: [],

  map: {
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  general: {
    colorMode: "system",
    selectedConnectionTab: "SERIAL",
  },
  about: null,
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
    setRecentConnections: (
      state,
      action: PayloadAction<RecentConnection[]>,
    ) => {
      state.recentConnections = action.payload;
    },
    addRecentConnection: (state, action: PayloadAction<RecentConnection>) => {
      const newConnection = action.payload;
      const existingIndex = state.recentConnections.findIndex(
        (conn) => conn.id === newConnection.id,
      );

      if (existingIndex >= 0) {
        // Update existing connection and move to front
        state.recentConnections[existingIndex] = newConnection;
        const [updated] = state.recentConnections.splice(existingIndex, 1);
        state.recentConnections.unshift(updated);
      } else {
        // Add new connection to front
        state.recentConnections.unshift(newConnection);
      }

      // Keep only the 10 most recent connections
      state.recentConnections = state.recentConnections.slice(0, 10);
    },
    removeRecentConnection: (
      state,
      action: PayloadAction<string>, // connection id
    ) => {
      state.recentConnections = state.recentConnections.filter(
        (conn) => conn.id !== action.payload,
      );
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
