import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TcpConnectionMeta = {
  address: string;
  port: number;
};

export interface IAppConfigState {
  lastTcpConnection: TcpConnectionMeta | null;
}

export const initialAppConfigState: IAppConfigState = {
  lastTcpConnection: null,
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
  },
});

export const { actions: appConfigActions, reducer: appConfigReducer } =
  appConfigSlice;
