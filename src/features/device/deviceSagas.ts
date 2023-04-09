import { invoke } from "@tauri-apps/api";
import { all, call, put, takeEvery } from "redux-saga/effects";

import { connectionSliceActions } from "@features/connection/connectionSlice";
import {
  ConfigStatusChannel,
  createConfigStatusChannel,
  createDeviceDisconnectChannel,
  createDeviceUpdateChannel,
  createGraphUpdateChannel,
  DeviceDisconnectChannel,
  DeviceUpdateChannel,
  GraphUpdateChannel,
  handleConfigStatusChannel,
  handleDeviceDisconnectChannel,
  handleDeviceUpdateChannel,
  handleGraphUpdateChannel,
} from "@features/device/deviceConnectionHandlerSagas";
import {
  requestAutoConnectPort,
  requestAvailablePorts,
  requestConnectToDevice,
  requestDisconnectFromDevice,
  requestNewWaypoint,
  requestSendMessage,
  requestUpdateUser,
} from "@features/device/deviceActions";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestSliceActions } from "@features/requests/requestReducer";
import type { CommandError } from "@utils/errors";

function* getAutoConnectPortWorker(
  action: ReturnType<typeof requestAutoConnectPort>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const portName = (yield call(
      invoke,
      "request_autoconnect_port",
    )) as string;

    yield put(deviceSliceActions.setAutoConnectPort(portName));

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

function* subscribeAll() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceUpdateChannel: DeviceUpdateChannel = yield call(
    createDeviceUpdateChannel,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceDisconnectChannel: DeviceDisconnectChannel = yield call(
    createDeviceDisconnectChannel,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const graphUpdateChannel: GraphUpdateChannel = yield call(
    createGraphUpdateChannel,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const configStatusChannel: ConfigStatusChannel = yield call(
    createConfigStatusChannel,
  );

  yield all([
    call(handleDeviceUpdateChannel, deviceUpdateChannel),
    call(handleDeviceDisconnectChannel, deviceDisconnectChannel),
    call(handleGraphUpdateChannel, graphUpdateChannel),
    call(handleConfigStatusChannel, configStatusChannel),
  ]);
}

function* getAvailableSerialPortsWorker(
  action: ReturnType<typeof requestAvailablePorts>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const serialPorts = (yield call(
      invoke,
      "get_all_serial_ports",
    )) as string[];

    yield put(deviceSliceActions.setAvailableSerialPorts(serialPorts));
    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

function* connectToDeviceWorker(
  action: ReturnType<typeof requestConnectToDevice>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));
    yield put(
      connectionSliceActions.setConnectionState({
        portName: action.payload,
        status: {
          status: "PENDING",
        },
      }),
    );

    yield call(disconnectFromDeviceWorker);
    yield call(invoke, "initialize_graph_state", { portName: action.payload });
    yield call(invoke, "connect_to_serial_port", { portName: action.payload });
    yield put(deviceSliceActions.setActiveSerialPort(action.payload));

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));

    yield call(subscribeAll);
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
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

function* sendTextWorker(action: ReturnType<typeof requestSendMessage>) {
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
        message: (error as CommandError).message,
      }),
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
        message: (error as CommandError).message,
      }),
    );
  }
}

function* newWaypoint(action: ReturnType<typeof requestNewWaypoint>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));
    yield call(invoke, "send_waypoint", {
      waypoint: action.payload.waypoint,
      channel: action.payload.channel,
    });

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

export function* devicesSaga() {
  yield all([
    takeEvery(
      requestAutoConnectPort.type,
      getAutoConnectPortWorker,
    ),
    takeEvery(requestAvailablePorts.type, getAvailableSerialPortsWorker),
    takeEvery(requestConnectToDevice.type, connectToDeviceWorker),
    takeEvery(requestDisconnectFromDevice.type, disconnectFromDeviceWorker),
    takeEvery(requestSendMessage.type, sendTextWorker),
    takeEvery(requestUpdateUser.type, updateUserConfig),
    takeEvery(requestNewWaypoint.type, newWaypoint),
  ]);
}
