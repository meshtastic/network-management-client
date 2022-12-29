import { invoke } from "@tauri-apps/api";
import { all, call, put, takeEvery } from "redux-saga/effects";

import {
  createDeviceUpdateChannel,
  handleDeviceUpdateChannel,
  DeviceUpdateChannel,
} from "@features/device/deviceConnectionHandlerSagas";
import {
  requestConnectToDevice,
  requestDisconnectFromDevice,
  requestSendMessage,
} from "@features/device/deviceActions";
import { deviceSliceActions } from "@features/device/deviceSlice";

function* subscribeAll() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceUpdateChannel: DeviceUpdateChannel = yield call(
    createDeviceUpdateChannel
  );

  yield all([call(handleDeviceUpdateChannel, deviceUpdateChannel)]);
}

function* connectToDeviceWorker() {
  try {
    yield call(invoke, "get_all_serial_ports");
    yield call(invoke, "connect_to_serial_port", { portName: "/dev/ttyACM0" });

    yield put(requestSendMessage({ channel: 0, text: "Device Initialized" }));

    yield call(subscribeAll);
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

function* disconnectFromDeviceWorker() {
  try {
    yield call(invoke, "disconnect_from_serial_port");
    yield put(deviceSliceActions.setDevice(null));
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
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

export function* devicesSaga() {
  yield all([
    takeEvery(requestConnectToDevice.type, connectToDeviceWorker),
    takeEvery(requestDisconnectFromDevice.type, disconnectFromDeviceWorker),
    takeEvery(requestSendMessage.type, sendMessageWorker),
  ]);
}
