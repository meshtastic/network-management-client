import type { RootState } from "@app/store";
import type { RequestStatus } from "@features/requests/requestReducer";

export const selectConnectionStatus =
  (portName: string) => (state: RootState): RequestStatus | null =>
    state.connection.connections?.[portName] ?? null;
