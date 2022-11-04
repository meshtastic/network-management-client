import { call, put, takeEvery } from "redux-saga/effects";
import { Types, Protobuf, ISerialConnection } from "@meshtastic/meshtasticjs";

import { createDeviceAction } from "@features/device/deviceActions";
import { deviceActions } from "@features/device/deviceSlice";

let serialPort: SerialPort | null = null;
const deviceConnections: Record<number, ISerialConnection> = {}; // device id -> connection

const subscribeAll = (connection: Types.ConnectionType) => {
  connection.setLogLevel(Protobuf.LogRecord_Level.TRACE);

  connection.onDeviceMetadataPacket.subscribe((metadataPacket) => {
    console.log("metadataPacket", metadataPacket);
  });

  connection.onRoutingPacket.subscribe((routingPacket) => {
    console.log("routingPacket", routingPacket);
  });

  connection.onTelemetryPacket.subscribe((telemetryPacket) => {
    console.log("telemetryPacket", telemetryPacket);
  });

  connection.onDeviceStatus.subscribe((status) => {
    console.log("status", status);
  });

  connection.onWaypointPacket.subscribe((waypoint) => {
    console.log("waypoint", waypoint);
  });

  connection.onMyNodeInfo.subscribe((nodeInfo) => {
    console.log("myNodeInfo", nodeInfo);
  });

  connection.onUserPacket.subscribe((user) => {
    console.log("user", user);
  });

  connection.onPositionPacket.subscribe((position) => {
    console.log("position", position);
  });

  connection.onNodeInfoPacket.subscribe((nodeInfo) => {
    console.log("nodeInfoPacket", nodeInfo);
  });

  connection.onChannelPacket.subscribe((channel) => {
    console.log("channel", channel);
  });

  connection.onConfigPacket.subscribe((config) => {
    console.log("configPacket", config);
  });

  connection.onModuleConfigPacket.subscribe((moduleConfig) => {
    console.log("moduleConfigPacket", moduleConfig);
  });

  connection.onMessagePacket.subscribe((messagePacket) => {
    console.log("messagePacket", messagePacket);
  });
};

const createConnection = async (id: number): Promise<ISerialConnection> => {
  const connection = new ISerialConnection(id);
  serialPort = await navigator.serial.requestPort();

  await connection.connect({
    port: serialPort,
    baudRate: undefined,
    concurrentLogOutput: true,
  });

  return connection;
};

function* createDeviceWorker(action: ReturnType<typeof createDeviceAction>) {
  try {
    const id = action.payload;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const connection: ISerialConnection = yield call(createConnection, id);

    // * Always adds connection, overwrites existing
    deviceConnections[id] = connection;

    yield call(subscribeAll, connection);
    yield put(deviceActions.createDevice(id));
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

export function* watchCreateDevice() {
  yield takeEvery(createDeviceAction.type, createDeviceWorker);
}
