import { invoke } from "@tauri-apps/api";
import { all, call, put, takeEvery } from "redux-saga/effects";

import {
  requestBeginConfigTransaction,
  requestCommitConfigTransaction
} from "@features/config/configActions";
import { requestSliceActions } from "@features/requests/requestReducer";
import type { CommandError } from "@utils/errors";

function* beginConfigTransactionWorker(
  action: ReturnType<typeof requestBeginConfigTransaction>
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "start_configuration_transaction");

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

function* commitConfigTransactionWorker(
  action: ReturnType<typeof requestCommitConfigTransaction>
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "commit_configuration_transaction");

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


export function* devicesSaga() {
  yield all([
    takeEvery(requestBeginConfigTransaction.type, beginConfigTransactionWorker),
    takeEvery(requestCommitConfigTransaction.type, commitConfigTransactionWorker),
  ]);
}
