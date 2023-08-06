import type { RootState } from "@app/store";
import type { RequestStatus } from "@features/requests/requestSlice";

export const selectConnectionStatus =
  (portName: string) =>
  (state: RootState): RequestStatus | null =>
    state.connection.connections?.[portName] ?? null;
