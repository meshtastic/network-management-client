import { invoke } from "@tauri-apps/api";
import { all, call, put, spawn, takeEvery } from "redux-saga/effects";

import {
  createDeviceUpdateChannel,
  handleDeviceUpdateChannel,
  DeviceUpdateChannel,
} from "@features/device/deviceConnectionHandlerSagas";
import {
  requestCreateDeviceAction,
  requestSendMessage,
} from "@features/device/deviceActions";

function* subscribeAll() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceUpdateChannel: DeviceUpdateChannel = yield call(
    createDeviceUpdateChannel
  );

  yield all([call(handleDeviceUpdateChannel, deviceUpdateChannel)]);
}

function* createDeviceWorker(
  action: ReturnType<typeof requestCreateDeviceAction>
) {
  try {
    invoke("get_all_serial_ports").then(console.log).catch(console.error);

    invoke("connect_to_serial_port", { portName: "/dev/ttyACM0" })
      .then(console.log)
      .catch(console.error);

    yield put(requestSendMessage({ channel: 0, text: "Device Initialized" }));

    yield call(subscribeAll);
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

function* watchCreateDevice() {
  yield takeEvery(requestCreateDeviceAction.type, createDeviceWorker);
}

function* sendMessageWorker(action: ReturnType<typeof requestSendMessage>) {
  try {
    yield call(invoke, "send_text", {
      channel: action.payload.channel,
      text: action.payload.text,
    });
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

function* watchSendMessage() {
  yield takeEvery(requestSendMessage.type, sendMessageWorker);
}

export function* devicesSaga() {
  yield all([spawn(watchCreateDevice), spawn(watchSendMessage)]);
}
