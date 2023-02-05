import { invoke } from "@tauri-apps/api";
import { all, call, put, takeEvery } from "redux-saga/effects";

import {
  createDeviceUpdateChannel,
  handleDeviceUpdateChannel,
  DeviceUpdateChannel,
} from "@features/device/deviceConnectionHandlerSagas";
import {
  requestAvailablePorts,
  requestConnectToDevice,
  requestDisconnectFromDevice,
  requestSendMessage,
  requestUpdateUser,
} from "@features/device/deviceActions";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestSliceActions } from "@features/requests/requestReducer";

function* subscribeAll() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceUpdateChannel: DeviceUpdateChannel = yield call(
    createDeviceUpdateChannel
  );

  yield all([call(handleDeviceUpdateChannel, deviceUpdateChannel)]);
}

function* getAvailableSerialPortsWorker(
  action: ReturnType<typeof requestAvailablePorts>
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const serialPorts = (yield call(
      invoke,
      "get_all_serial_ports"
    )) as string[];

    yield put(deviceSliceActions.setAvailableSerialPorts(serialPorts));
    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as Error).message,
      })
    );
  }
}

function* connectToDeviceWorker(
  action: ReturnType<typeof requestConnectToDevice>
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(disconnectFromDeviceWorker);
    yield call(invoke, "connect_to_serial_port", { portName: action.payload });
    yield put(deviceSliceActions.setActiveSerialPort(action.payload));

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));

    yield call(subscribeAll);
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as Error).message,
      })
    );
  }
}

function* disconnectFromDeviceWorker() {
  try {
    yield call(invoke, "disconnect_from_serial_port");
    yield put(deviceSliceActions.setActiveSerialPort(null));
    yield put(deviceSliceActions.setActiveNode(null));
    yield put(deviceSliceActions.setDevice(null));
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

function* sendMessageWorker(action: ReturnType<typeof requestSendMessage>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "send_text", {
      channel: action.payload.channel,
      text: action.payload.text,
    });

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as Error).message,
      })
    );
  }
}

function* updateUserConfig(action: ReturnType<typeof requestUpdateUser>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "update_device_user", {
      user: action.payload.user,
    });

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as Error).message,
      })
    );
  }
}

export function* devicesSaga() {
  yield all([
    takeEvery(requestAvailablePorts.type, getAvailableSerialPortsWorker),
    takeEvery(requestConnectToDevice.type, connectToDeviceWorker),
    takeEvery(requestDisconnectFromDevice.type, disconnectFromDeviceWorker),
    takeEvery(requestSendMessage.type, sendMessageWorker),
    takeEvery(requestUpdateUser.type, updateUserConfig),
  ]);
}
