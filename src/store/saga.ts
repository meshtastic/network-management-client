import { all, fork } from "redux-saga/effects";

import { algorithmsSaga } from "@features/algorithms/algorithmsSagas";
import { devicesSaga } from "@features/device/deviceSagas";

export default function* rootSaga() {
  yield all([fork(devicesSaga), fork(algorithmsSaga)]);
}
