import { all, call, put, takeEvery } from "redux-saga/effects";
import { Store } from "tauri-plugin-store-api";

import {
  requestFetchLastTcpConnectionMeta,
  requestPersistLastTcpConnectionMeta,
  requestPersistGeneralConfig,
  requestPersistMapConfig,
} from "@features/appConfig/actions";
import { ColorMode, appConfigSliceActions } from "@features/appConfig/slice";
import { requestInitializeApplication } from "@features/device/actions";
import { requestSliceActions } from "@features/requests/slice";

import type { CommandError } from "@utils/errors";
import {
  DEFAULT_STORE_FILE_NAME,
  IPersistedState,
  PersistedStateKeys,
  getValueFromPersistedStore,
  setValueInPersistedStore,
} from "@utils/persistence";

const defaultStore = new Store(DEFAULT_STORE_FILE_NAME);

function* fetchLastTcpConnectionMetaWorker(
  action: ReturnType<typeof requestFetchLastTcpConnectionMeta>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const persistedValue = (yield getValueFromPersistedStore(
      defaultStore,
      PersistedStateKeys.LastTcpConnection,
    )) as IPersistedState[PersistedStateKeys.LastTcpConnection];

    yield put(
      appConfigSliceActions.setLastTcpConnection(persistedValue ?? null),
    );

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

function* persistLastTcpConnectionMetaWorker(
  action: ReturnType<typeof requestPersistLastTcpConnectionMeta>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield setValueInPersistedStore(
      defaultStore,
      PersistedStateKeys.LastTcpConnection,
      action.payload ?? undefined,
    );

    // Fetch value from store to ensure it was set correctly
    const persistedValue = (yield getValueFromPersistedStore(
      defaultStore,
      PersistedStateKeys.LastTcpConnection,
    )) as IPersistedState[PersistedStateKeys.LastTcpConnection];

    if (JSON.stringify(persistedValue) !== JSON.stringify(action.payload)) {
      throw new Error("Failed to persist last TCP connection");
    }

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

/**
 * Check if dark mode was manually selected or if system color mode is dark
 * Add or remove the "dark" class from the document based on the selected mode
 * https://tailwindcss.com/docs/dark-mode#supporting-system-preference-and-manual-selection
 * @throws {Error} If the browser doesn't support the `matchMedia` API
 * @param colorMode Color mode to apply a CSS class for
 */
function setColorModeClassWorker(colorMode: ColorMode) {
  if (
    colorMode === "dark" || // Manual dark mode
    (colorMode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches) // System dark mode
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function* persistGeneralConfigWorker(
  action: ReturnType<typeof requestPersistGeneralConfig>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield setValueInPersistedStore(
      defaultStore,
      PersistedStateKeys.GeneralConfig,
      action.payload,
    );

    // Fetch value from store to ensure it was set correctly
    const persistedValue = (yield getValueFromPersistedStore(
      defaultStore,
      PersistedStateKeys.GeneralConfig,
    )) as IPersistedState[PersistedStateKeys.GeneralConfig];

    if (JSON.stringify(persistedValue) !== JSON.stringify(action.payload)) {
      throw new Error("Failed to persist general application config");
    }

    yield call(setColorModeClassWorker, action.payload.colorMode);

    // Update redux cache value
    yield put(appConfigSliceActions.updateGeneralConfig(action.payload));

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

function* persistMapConfigWorker(
  action: ReturnType<typeof requestPersistMapConfig>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield setValueInPersistedStore(
      defaultStore,
      PersistedStateKeys.MapConfig,
      action.payload,
    );

    // Fetch value from store to ensure it was set correctly
    const persistedValue = (yield getValueFromPersistedStore(
      defaultStore,
      PersistedStateKeys.MapConfig,
    )) as IPersistedState[PersistedStateKeys.MapConfig];

    if (JSON.stringify(persistedValue) !== JSON.stringify(action.payload)) {
      throw new Error("Failed to persist map config");
    }

    // Update redux cache value
    yield put(appConfigSliceActions.updateMapConfig(action.payload));

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

function* initializeAppConfigWorker(
  action: ReturnType<typeof requestInitializeApplication>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const persistedGeneralConfig = (yield getValueFromPersistedStore(
      defaultStore,
      PersistedStateKeys.GeneralConfig,
    )) as IPersistedState[PersistedStateKeys.GeneralConfig];

    if (persistedGeneralConfig) {
      yield put(
        appConfigSliceActions.updateGeneralConfig(persistedGeneralConfig),
      );
    }

    const persistedMapConfig = (yield getValueFromPersistedStore(
      defaultStore,
      PersistedStateKeys.MapConfig,
    )) as IPersistedState[PersistedStateKeys.MapConfig];

    if (persistedMapConfig) {
      yield put(appConfigSliceActions.updateMapConfig(persistedMapConfig));
    }

    // Initialize color theme when data loaded
    yield call(
      setColorModeClassWorker,
      persistedGeneralConfig?.colorMode ?? "system",
    );

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

export function* appConfigSaga() {
  yield all([
    takeEvery(
      requestFetchLastTcpConnectionMeta.type,
      fetchLastTcpConnectionMetaWorker,
    ),
    takeEvery(
      requestPersistLastTcpConnectionMeta.type,
      persistLastTcpConnectionMetaWorker,
    ),
    takeEvery(requestPersistGeneralConfig.type, persistGeneralConfigWorker),
    takeEvery(requestPersistMapConfig.type, persistMapConfigWorker),
    takeEvery(requestInitializeApplication.type, initializeAppConfigWorker),
  ]);
}
