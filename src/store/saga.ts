import { all, fork, takeLatest } from "redux-saga/effects";
import { requestDemoAPI } from "@features/demoAPI/demoAPIActions";
import { fetchNumberWorkerSaga } from "@features/demoAPI/demoAPISaga";
import { devicesSaga } from "@features/device/deviceSagas";

export default function* rootSaga() {
  yield all([
    takeLatest(requestDemoAPI.type, fetchNumberWorkerSaga),
    fork(devicesSaga),
  ]);
}
