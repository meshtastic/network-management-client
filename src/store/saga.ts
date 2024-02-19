import { all, fork } from "redux-saga/effects";

import { appConfigSaga } from "@features/appConfig/sagas";
import { configSaga } from "@features/config/sagas";
import { devicesSaga } from "@features/device/sagas";

export function* rootSaga() {
  yield all([fork(appConfigSaga), fork(configSaga), fork(devicesSaga)]);
}
