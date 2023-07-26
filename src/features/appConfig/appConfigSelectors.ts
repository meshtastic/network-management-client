import type { RootState } from "@app/store";
import type {
  IMapConfigState,
  TcpConnectionMeta,
} from "@features/appConfig/appConfigSlice";

export const selectPersistedTCPConnectionMeta =
  () =>
  (state: RootState): TcpConnectionMeta | null =>
    state.appConfig.lastTcpConnection;

export const selectMapConfigState =
  () =>
  (state: RootState): IMapConfigState =>
    state.appConfig.map;
