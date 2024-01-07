import { invoke } from "@tauri-apps/api";
import { all, call, put, takeEvery } from "redux-saga/effects";

import { requestRunAllAlgorithms } from "@features/algorithms/actions";
import {
  algorithmsSliceActions,
  IAlgorithmsState,
} from "@features/algorithms/slice";
import { requestSliceActions } from "@features/requests/slice";

import type { CommandError } from "@utils/errors";

function* runAllAlgorithmsWorker(
  action: ReturnType<typeof requestRunAllAlgorithms>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const results = (yield call(
      invoke,
      "run_algorithms",
      action.payload,
    )) as IAlgorithmsState;

    yield put(algorithmsSliceActions.setApResult(results.apResult));
    yield put(algorithmsSliceActions.setMincutResult(results.mincutResult));

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

export function* algorithmsSaga() {
  yield all([takeEvery(requestRunAllAlgorithms.type, runAllAlgorithmsWorker)]);
}
