import type { RootState } from "@app/store";
import type { IRequestState } from "./requestReducer";

export const selectRequestStateByName =
  (name: string) =>
  (state: RootState): IRequestState | null =>
    state.requests.status?.[name] ?? null;
