import { all, put, takeEvery } from "redux-saga/effects";
import { Store } from "tauri-plugin-store-api";

import {
  requestFetchLastTcpConnectionMeta,
  requestPersistLastTcpConnectionMeta,
} from "@features/appConfig/appConfigActions";
import { appConfigSliceActions } from "@features/appConfig/appConfigSlice";
import { requestSliceActions } from "@features/requests/requestReducer";

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
  action: ReturnType<typeof requestFetchLastTcpConnectionMeta>
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const persistedValue = (yield getValueFromPersistedStore(
      defaultStore,
      PersistedStateKeys.LastTcpConnection
    )) as IPersistedState[PersistedStateKeys.LastTcpConnection];

    yield put(
      appConfigSliceActions.setLastTcpConnection(persistedValue ?? null)
    );

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      })
    );
  }
}

function* persistLastTcpConnectionMetaWorker(
  action: ReturnType<typeof requestPersistLastTcpConnectionMeta>
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield setValueInPersistedStore(
      defaultStore,
      PersistedStateKeys.LastTcpConnection,
      action.payload ?? undefined
    );

    // Fetch value from store to ensure it was set correctly
    const persistedValue = (yield getValueFromPersistedStore(
      defaultStore,
      PersistedStateKeys.LastTcpConnection
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
      })
    );
  }
}

export function* appConfigSaga() {
  yield all([
    takeEvery(
      requestFetchLastTcpConnectionMeta.type,
      fetchLastTcpConnectionMetaWorker
    ),
    takeEvery(
      requestPersistLastTcpConnectionMeta.type,
      persistLastTcpConnectionMetaWorker
    ),
  ]);
}
