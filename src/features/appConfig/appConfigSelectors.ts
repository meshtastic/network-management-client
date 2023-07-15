import type { RootState } from "@app/store";
import type { TcpConnectionMeta } from "@features/appConfig/appConfigSlice";

export const selectPersistedTCPConnectionMeta =
  () =>
  (state: RootState): TcpConnectionMeta | null =>
    state.appConfig.lastTcpConnection;
