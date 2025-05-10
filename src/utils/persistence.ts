import type {
  IGeneralConfigState,
  IMapConfigState,
  TcpConnectionMeta,
} from "@features/appConfig/slice";
import type { Store } from "@tauri-apps/plugin-store";

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

export async function setAndValidateValueInPersistedStore<
  TKey extends keyof IPersistedState,
  TValue extends IPersistedState[TKey],
>(
  store: Store,
  key: TKey,
  value: TValue,
  save = true,
  errorMessage: string | null = null,
) {
  await setValueInPersistedStore(store, key, value, save);

  const fetchedValue = await getValueFromPersistedStore(store, key);

  if (JSON.stringify(fetchedValue) !== JSON.stringify(value)) {
    throw new Error(
      errorMessage ?? "Failed to persist value in persistent store",
    );
  }
}

export async function setValueInPersistedStore<
  TKey extends keyof IPersistedState,
>(store: Store, key: TKey, value: IPersistedState[TKey], save = true) {
  await store.set(key, value);

  if (save) {
    await store.save();
  }
}

export async function getValueFromPersistedStore<
  TKey extends keyof IPersistedState,
>(store: Store, key: TKey) {
  const val = await store.get<IPersistedState[TKey]>(key);
  return val;
}
