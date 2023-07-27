import type { RootState } from "@app/store";
import type {
  IGeneralConfigState,
  IMapConfigState,
  TcpConnectionMeta,
} from "@features/appConfig/appConfigSlice";

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
