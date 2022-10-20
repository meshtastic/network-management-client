import { takeLatest } from "redux-saga/effects";
import { requestDemoAPI } from "@features/demoAPI/demoAPIActions";
import { fetchNumberWorkerSaga } from "@features/demoAPI/demoAPISaga";

export default function* rootSaga() {
  yield takeLatest(requestDemoAPI.type, fetchNumberWorkerSaga);
}
