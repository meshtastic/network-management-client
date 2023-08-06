import { all, fork } from "redux-saga/effects";

import { algorithmsSaga } from "@features/algorithms/sagas";
import { appConfigSaga } from "@features/appConfig/sagas";
import { configSaga } from "@features/config/sagas";
import { devicesSaga } from "@features/device/sagas";

export default function* rootSaga() {
  yield all([
    fork(algorithmsSaga),
    fork(appConfigSaga),
    fork(configSaga),
    fork(devicesSaga),
  ]);
}
