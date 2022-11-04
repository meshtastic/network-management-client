import { all, call, takeLatest } from "redux-saga/effects";
import { requestDemoAPI } from "@features/demoAPI/demoAPIActions";
import { fetchNumberWorkerSaga } from "@features/demoAPI/demoAPISaga";
import { watchCreateDevice } from "@features/device/deviceSagas";

export default function* rootSaga() {
  yield all([
    takeLatest(requestDemoAPI.type, fetchNumberWorkerSaga),
    call(watchCreateDevice),
  ]);
}
