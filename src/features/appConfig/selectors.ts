import type { RootState } from "@app/store";
import type {
  IGeneralConfigState,
  IMapConfigState,
  TcpConnectionMeta,
  RecentConnection,
} from "@features/appConfig/slice";

export const selectPersistedTCPConnectionMeta =
  () =>
  (state: RootState): TcpConnectionMeta | null =>
    state.appConfig.lastTcpConnection;

export const selectGeneralConfigState =
  () =>
  (state: RootState): IGeneralConfigState =>
    state.appConfig.general;

export const selectMapConfigState =
  () =>
  (state: RootState): IMapConfigState =>
    state.appConfig.map;

export const selectRecentConnections =
  () =>
  (state: RootState): RecentConnection[] =>
    state.appConfig.recentConnections;
