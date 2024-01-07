import { createAction } from "@reduxjs/toolkit";
import type {
  IGeneralConfigState,
  IMapConfigState,
  TcpConnectionMeta,
} from "@features/appConfig/slice";

export const requestFetchLastTcpConnectionMeta = createAction(
  "@appConfig/fetch-last-tcp-connection-meta",
);

export const requestPersistLastTcpConnectionMeta =
  createAction<TcpConnectionMeta | null>(
    "@appConfig/persist-last-tcp-connection-meta",
  );

export const requestPersistGeneralConfig = createAction<IGeneralConfigState>(
  "@appConfig/persist-general-config",
);

export const requestPersistMapConfig = createAction<IMapConfigState>(
  "@appConfig/persist-map-config",
);
