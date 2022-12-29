import { all, fork } from "redux-saga/effects";
import { devicesSaga } from "@features/device/deviceSagas";

export default function* rootSaga() {
  yield all([fork(devicesSaga)]);
}
