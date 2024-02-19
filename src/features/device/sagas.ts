import { invoke } from "@tauri-apps/api";
import type { Task } from "redux-saga";
import { all, call, cancel, fork, put, takeEvery } from "redux-saga/effects";

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
  GraphUpdateChannel,
  RebootChannel,
  createConfigStatusChannel,
  createDeviceDisconnectChannel,
  createDeviceUpdateChannel,
  createGraphUpdateChannel,
  createRebootChannel,
  handleConfigStatusChannel,
  handleDeviceDisconnectChannel,
  handleDeviceUpdateChannel,
  handleGraphUpdateChannel,
  handleRebootChannel,
} from "@features/device/connectionHandlerSagas";
import { deviceSliceActions } from "@features/device/slice";
import { requestSliceActions } from "@features/requests/slice";
import { uiSliceActions } from "@features/ui/slice";

import { ConnectionType, DeviceKey } from "@utils/connections";
import type { CommandError } from "@utils/errors";
import { error } from "@utils/errors";

// Currently this only suports serial ports
function* getAutoConnectPortWorker(
  action: ReturnType<typeof requestAutoConnectPort>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const portName = (yield call(invoke, "request_autoconnect_port")) as string;

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

  const graphUpdateChannel: GraphUpdateChannel = yield call(
    createGraphUpdateChannel,
  );

  const configStatusChannel: ConfigStatusChannel = yield call(
    createConfigStatusChannel,
  );

  const rebootChannel: RebootChannel = yield call(createRebootChannel);

  yield all([
    call(handleDeviceUpdateChannel, deviceUpdateChannel),
    call(handleDeviceDisconnectChannel, deviceDisconnectChannel),
    call(handleGraphUpdateChannel, graphUpdateChannel),
    call(handleConfigStatusChannel, configStatusChannel),
    call(handleRebootChannel, rebootChannel),
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

function* connectToDeviceWorker(
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
      yield call(invoke, "connect_to_serial_port", {
        portName: action.payload.params.portName,
      });
    }

    if (action.payload.params.type === ConnectionType.TCP) {
      yield call(invoke, "connect_to_tcp_port", {
        address: action.payload.params.socketAddress,
      });
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

function* disconnectFromDeviceWorker(
  action: ReturnType<typeof requestDisconnectFromDevice>,
) {
  try {
    yield call(invoke, "drop_device_connection", {
      deviceKey: action.payload,
    });
    yield put(deviceSliceActions.setPrimaryDeviceConnectionKey(null));
    yield put(uiSliceActions.setActiveNode(null));
    yield put(deviceSliceActions.setDevice(null));
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

function* disconnectFromAllDevicesWorker() {
  try {
    yield call(invoke, "drop_all_device_connections");
    yield put(deviceSliceActions.setPrimaryDeviceConnectionKey(null));
    yield put(uiSliceActions.setActiveNode(null));
    yield put(deviceSliceActions.setDevice(null));
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

function* sendTextWorker(action: ReturnType<typeof requestSendMessage>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "send_text", {
      deviceKey: action.payload.deviceKey,
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

function* updateUserConfigWorker(action: ReturnType<typeof requestUpdateUser>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "update_device_user", {
      deviceKey: action.payload.deviceKey,
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

function* sendWaypointWorker(action: ReturnType<typeof requestSendWaypoint>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "send_waypoint", {
      deviceKey: action.payload.deviceKey,
      channel: action.payload.channel,
      waypoint: action.payload.waypoint,
    });

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

function* deleteWaypointWorker(
  action: ReturnType<typeof requestDeleteWaypoint>,
) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    yield call(invoke, "delete_waypoint", {
      deviceKey: action.payload.deviceKey,
      waypointId: action.payload.waypointId,
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
