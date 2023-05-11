import { invoke } from "@tauri-apps/api";
import { all, call, cancel, fork, put, takeEvery } from "redux-saga/effects";
import type { Task } from "redux-saga";

import { connectionSliceActions } from "@features/connection/connectionSlice";
import {
  ConfigStatusChannel,
  createConfigStatusChannel,
  createDeviceDisconnectChannel,
  createDeviceUpdateChannel,
  createGraphUpdateChannel,
  createRebootChannel,
  DeviceDisconnectChannel,
  DeviceUpdateChannel,
  GraphUpdateChannel,
  handleConfigStatusChannel,
  handleDeviceDisconnectChannel,
  handleDeviceUpdateChannel,
  handleGraphUpdateChannel,
  handleRebootChannel,
  RebootChannel,
} from "@features/device/deviceConnectionHandlerSagas";
import {
  requestAutoConnectPort,
  requestAvailablePorts,
  requestConnectToDevice,
  requestDisconnectFromAllDevices,
  requestDisconnectFromDevice,
  requestNewWaypoint,
  requestSendMessage,
  requestUpdateUser,
} from "@features/device/deviceActions";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestSliceActions } from "@features/requests/requestReducer";
import type { CommandError } from "@utils/errors";

function* getAutoConnectPortWorker(
  action: ReturnType<typeof requestAutoConnectPort>
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const portName = (yield call(invoke, "request_autoconnect_port")) as string;

    yield put(deviceSliceActions.setAutoConnectPort(portName));

    // Automatically connect to port
    if (portName) {
      yield put(requestConnectToDevice({ portName, setPrimary: true }));
    }

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      })
    );
  }
}

function* subscribeAll() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceUpdateChannel: DeviceUpdateChannel = yield call(
    createDeviceUpdateChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceDisconnectChannel: DeviceDisconnectChannel = yield call(
    createDeviceDisconnectChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const graphUpdateChannel: GraphUpdateChannel = yield call(
    createGraphUpdateChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const configStatusChannel: ConfigStatusChannel = yield call(
    createConfigStatusChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const rebootChannel: RebootChannel = yield call(
    createRebootChannel
  );

  yield all([
    call(handleDeviceUpdateChannel, deviceUpdateChannel),
    call(handleDeviceDisconnectChannel, deviceDisconnectChannel),
    call(handleGraphUpdateChannel, graphUpdateChannel),
    call(handleConfigStatusChannel, configStatusChannel),
    call(handleRebootChannel, rebootChannel)
  ]);
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
        message: (error as CommandError).message,
      })
    );
  }
}

function* connectToDeviceWorker(
  action: ReturnType<typeof requestConnectToDevice>
) {
  let subscribeTask: Task | null = null;

  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));
    yield put(
      connectionSliceActions.setConnectionState({
        portName: action.payload.portName,
        status: {
          status: "PENDING",
        },
      })
    );

    // Need to subscribe to events before connecting
    // * Can't block as these are infinite loops
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    subscribeTask = yield fork(subscribeAll) as unknown as Task;

    yield call(invoke, "initialize_graph_state");

    yield call(invoke, "connect_to_serial_port", {
      portName: action.payload.portName,
    });

    if (action.payload.setPrimary) {
      yield put(
        deviceSliceActions.setPrimarySerialPort(action.payload.portName)
      );
    }

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));

    // ! Will eventually need to kill these tasks
    // ! to avoid memory leaks with many devices connected
    // if (subscribeTask) {
    //   yield subscribeTask?.toPromise();
    // }
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      })
    );

    yield put(
      connectionSliceActions.setConnectionState({
        portName: action.payload.portName,
        status: {
          status: "FAILED",
          message: (error as CommandError).message,
        },
      })
    );

    if (subscribeTask) {
      yield cancel(subscribeTask);
    }
  }
}

function* disconnectFromDeviceWorker(
  action: ReturnType<typeof requestDisconnectFromDevice>
) {
  try {
    yield call(invoke, "disconnect_from_serial_port", {
      portName: action.payload,
    });
    yield put(deviceSliceActions.setPrimarySerialPort(null));
    yield put(deviceSliceActions.setActiveNode(null));
    yield put(deviceSliceActions.setDevice(null));
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

function* disconnectFromAllDevicesWorker() {
  try {
    yield call(invoke, "disconnect_from_all_serial_ports");
    yield put(deviceSliceActions.setPrimarySerialPort(null));
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
      portName: action.payload.portName,
      channel: action.payload.channel,
      text: action.payload.text,
    });

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      })
    );
  }
}

function* updateUserConfig(action: ReturnType<typeof requestUpdateUser>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "update_device_user", {
      portName: action.payload.portName,
      user: action.payload.user,
    });

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      })
    );
  }
}

function* newWaypoint(action: ReturnType<typeof requestNewWaypoint>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));
    yield call(invoke, "send_waypoint", {
      portName: action.payload.portName,
      waypoint: action.payload.waypoint,
      channel: action.payload.channel,
    });

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      })
    );
  }
}

export function* devicesSaga() {
  yield all([
    takeEvery(requestAutoConnectPort.type, getAutoConnectPortWorker),
    takeEvery(requestAvailablePorts.type, getAvailableSerialPortsWorker),
    takeEvery(requestConnectToDevice.type, connectToDeviceWorker),
    takeEvery(requestDisconnectFromDevice.type, disconnectFromDeviceWorker),
    takeEvery(
      requestDisconnectFromAllDevices.type,
      disconnectFromAllDevicesWorker
    ),
    takeEvery(requestSendMessage.type, sendTextWorker),
    takeEvery(requestUpdateUser.type, updateUserConfig),
    takeEvery(requestNewWaypoint.type, newWaypoint),
  ]);
}
