import type { Task } from "redux-saga";
import { all, call, cancel, fork, put, takeEvery } from "redux-saga/effects";

import * as radioApi from "@api/backend/radio";
import * as meshApi from "@api/backend/mesh";
import * as connectionApi from "@api/backend/connection";

import { connectionSliceActions } from "@features/connection/slice";
import {
  requestAutoConnectPort,
  requestAvailablePorts,
  requestConnectToDevice,
  requestDeleteWaypoint,
  requestDisconnectFromAllDevices,
  requestDisconnectFromDevice,
  requestInitializeApplication,
  requestSendMessage,
  requestSendWaypoint,
  requestUpdateUser,
} from "@features/device/actions";
import {
  ConfigStatusChannel,
  DeviceDisconnectChannel,
  DeviceUpdateChannel,
  RebootChannel,
  createConfigStatusChannel,
  createDeviceDisconnectChannel,
  createDeviceUpdateChannel,
  createRebootChannel,
  handleConfigStatusChannel,
  handleDeviceDisconnectChannel,
  handleDeviceUpdateChannel,
  handleRebootChannel,
} from "@features/device/connectionHandlerSagas";
import { deviceSliceActions } from "@features/device/slice";
import { requestSliceActions } from "@features/requests/slice";
import { uiSliceActions } from "@features/ui/slice";

import { ConnectionType, DeviceKey } from "@utils/connections";
import type { CommandError } from "@utils/errors";
import { error } from "@utils/errors";

// Currently this only suports serial ports
async function* getAutoConnectPortWorker(
  action: ReturnType<typeof requestAutoConnectPort>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const portName = await connectionApi.requestAutoConnectPort();

    yield put(deviceSliceActions.setAutoConnectPort(portName));

    // Automatically connect to port
    if (portName) {
      yield put(
        requestConnectToDevice({
          params: {
            type: ConnectionType.SERIAL,
            portName,
            dtr: true,
            rts: false,
          },
          setPrimary: true,
        }),
      );
    }

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
  const deviceUpdateChannel: DeviceUpdateChannel = yield call(
    createDeviceUpdateChannel,
  );

  const deviceDisconnectChannel: DeviceDisconnectChannel = yield call(
    createDeviceDisconnectChannel,
  );

  const configStatusChannel: ConfigStatusChannel = yield call(
    createConfigStatusChannel,
  );

  const rebootChannel: RebootChannel = yield call(createRebootChannel);

  yield all([
    call(handleDeviceUpdateChannel, deviceUpdateChannel),
    call(handleDeviceDisconnectChannel, deviceDisconnectChannel),
    call(handleConfigStatusChannel, configStatusChannel),
    call(handleRebootChannel, rebootChannel),
  ]);
}

async function* getAvailableSerialPortsWorker(
  action: ReturnType<typeof requestAvailablePorts>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const serialPorts = await connectionApi.getAllSerialPorts();

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

function* initializeApplicationWorker(
  action: ReturnType<typeof requestInitializeApplication>,
) {
  try {
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

async function* connectToDeviceWorker(
  action: ReturnType<typeof requestConnectToDevice>,
) {
  let subscribeTask: Task | null = null;
  const deviceKey: DeviceKey =
    action.payload.params.type === ConnectionType.SERIAL
      ? action.payload.params.portName
      : action.payload.params.type === ConnectionType.TCP
        ? action.payload.params.socketAddress
        : error("Neither portName nor socketAddress were set");

  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));
    yield put(
      connectionSliceActions.setConnectionState({
        deviceKey,
        status: {
          status: "PENDING",
        },
      }),
    );

    // Need to subscribe to events before connecting
    // * Can't block as these are infinite loops
    subscribeTask = yield fork(subscribeAll) as unknown as Task;

    if (action.payload.params.type === ConnectionType.SERIAL) {
      await connectionApi.connectToSerialPort(
        action.payload.params.portName,
        undefined,
        action.payload.params.dtr,
        action.payload.params.rts,
      );
    }

    if (action.payload.params.type === ConnectionType.TCP) {
      await connectionApi.connectToTcpPort(action.payload.params.socketAddress);
    }

    if (action.payload.setPrimary) {
      if (action.payload.params.type === ConnectionType.SERIAL) {
        yield put(
          deviceSliceActions.setPrimaryDeviceConnectionKey(
            action.payload.params.portName,
          ),
        );
      }

      if (action.payload.params.type === ConnectionType.TCP) {
        yield put(
          deviceSliceActions.setPrimaryDeviceConnectionKey(
            action.payload.params.socketAddress,
          ),
        );
      }
    }

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));

    // ! Will eventually need to kill these tasks
    // ! to avoid memory leaks with many devices connected
    // if (subscribeTask) {
    //   yield subscribeTask?.toPromise();
    // }
  } catch (e) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (e as CommandError).message,
      }),
    );

    yield put(
      connectionSliceActions.setConnectionState({
        deviceKey,
        status: {
          status: "FAILED",
          message: (e as CommandError).message,
        },
      }),
    );

    if (subscribeTask) {
      yield cancel(subscribeTask);
    }
  }
}

async function* disconnectFromDeviceWorker(
  action: ReturnType<typeof requestDisconnectFromDevice>,
) {
  try {
    await connectionApi.dropDeviceConnection(action.payload);

    yield put(deviceSliceActions.setPrimaryDeviceConnectionKey(null));
    yield put(uiSliceActions.setActiveNode(null));
    yield put(deviceSliceActions.setDevice(null));
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

async function* disconnectFromAllDevicesWorker() {
  try {
    await connectionApi.dropAllDeviceConnections();

    yield put(deviceSliceActions.setPrimaryDeviceConnectionKey(null));
    yield put(uiSliceActions.setActiveNode(null));
    yield put(deviceSliceActions.setDevice(null));
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

async function* sendTextWorker(action: ReturnType<typeof requestSendMessage>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    await meshApi.sendText(
      action.payload.deviceKey,
      action.payload.channel,
      action.payload.text,
    );

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

function* updateUserConfigWorker(action: ReturnType<typeof requestUpdateUser>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    radioApi.updateDeviceUser(action.payload.deviceKey, action.payload.user);

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

async function* sendWaypointWorker(
  action: ReturnType<typeof requestSendWaypoint>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    await meshApi.sendWaypoint(
      action.payload.deviceKey,
      action.payload.channel,
      action.payload.waypoint,
    );

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    console.error(error);
    // TODO error.message doesn't catch invalid Tauri type errors
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      }),
    );
  }
}

async function* deleteWaypointWorker(
  action: ReturnType<typeof requestDeleteWaypoint>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    await meshApi.deleteWaypoint(
      action.payload.deviceKey,
      action.payload.waypointId,
    );

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
    takeEvery(requestAutoConnectPort.type, getAutoConnectPortWorker),
    takeEvery(requestAvailablePorts.type, getAvailableSerialPortsWorker),
    takeEvery(requestInitializeApplication.type, initializeApplicationWorker),
    takeEvery(requestConnectToDevice.type, connectToDeviceWorker),
    takeEvery(requestDisconnectFromDevice.type, disconnectFromDeviceWorker),
    takeEvery(
      requestDisconnectFromAllDevices.type,
      disconnectFromAllDevicesWorker,
    ),
    takeEvery(requestSendMessage.type, sendTextWorker),
    takeEvery(requestUpdateUser.type, updateUserConfigWorker),
    takeEvery(requestSendWaypoint.type, sendWaypointWorker),
    takeEvery(requestDeleteWaypoint.type, deleteWaypointWorker),
  ]);
}
