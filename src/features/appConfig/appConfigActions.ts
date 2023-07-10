import { createAction } from "@reduxjs/toolkit";
import type { TcpConnectionMeta } from "@features/appConfig/appConfigSlice";

export const requestFetchLastTcpConnectionMeta = createAction(
  "@appConfig/fetch-last-tcp-connection-meta"
);

export const requestPersistLastTcpConnectionMeta =
  createAction<TcpConnectionMeta | null>(
    "@appConfig/persist-last-tcp-connection-meta"
  );
