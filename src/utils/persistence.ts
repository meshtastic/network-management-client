import type {
  IGeneralConfigState,
  IMapConfigState,
  TcpConnectionMeta,
} from "@features/appConfig/slice";
import type { Store } from "tauri-plugin-store-api";

export const DEFAULT_STORE_FILE_NAME = "config.bin";

export enum PersistedStateKeys {
  LastTcpConnection = "lastTcpConnection",
  GeneralConfig = "generalConfig",
  MapConfig = "mapConfig",
}

export interface IPersistedState {
  [PersistedStateKeys.LastTcpConnection]?: TcpConnectionMeta;
  [PersistedStateKeys.GeneralConfig]?: IGeneralConfigState;
  [PersistedStateKeys.MapConfig]?: IMapConfigState;
}

export function* setValueInPersistedStore<TKey extends keyof IPersistedState>(
  store: Store,
  key: TKey,
  value: IPersistedState[TKey],
  save = true
) {
  yield store.set(key, value);

  if (save) {
    yield store.save();
  }
}

export function* getValueFromPersistedStore<TKey extends keyof IPersistedState>(
  store: Store,
  key: TKey
) {
  const val = (yield store.get(key)) as IPersistedState[TKey];
  return val;
}
