import { all, call, put, takeEvery } from "redux-saga/effects";
import { Types, Protobuf, ISerialConnection } from "@meshtastic/meshtasticjs";

import { createDeviceAction } from "@features/device/deviceActions";
import { deviceSliceActions } from "@features/device/deviceSlice";
import {
  ChannelPacketChannel,
  ConfigPacketChannel,
  createChannelPacketChannel,
  createConfigPacketChannel,
  createDeviceMetadataPacketChannel,
  createDeviceStatusPacketChannel,
  createMessagePacketChannel,
  createModuleConfigPacketChannel,
  createNodeInfoPacketChannel,
  createPositionPacketChannel,
  createRoutingPacketChannel,
  createTelemetryPacketChannel,
  createUserPacketChannel,
  createWaypointPacketChannel,
  DeviceMetadataPacketChannel,
  DeviceStatusChannel,
  handleChannelPacketChannel,
  handleConfigPacketChannel,
  handleDeviceMetadataPacketChannel,
  handleDeviceStatusPacketChannel,
  handleMessageChannel,
  handleModuleConfigPacketChannel,
  handleNodeInfoPacketChannel,
  handlePositionPacketChannel,
  handleRoutingPacketChannel,
  handleTelemetryPacketChannel,
  handleUserPacketChannel,
  handleWaypointPacketChannel,
  MessagePacketChannel,
  ModuleConfigPacketChannel,
  NodeInfoPacketChannel,
  PostionPacketChannel,
  RoutingPacketChannel,
  TelemetryPacketChannel,
  UserPacketChannel,
  WaypointPacketChannel,
} from "@features/device/deviceConnectionHandlerSagas";

const subscribeNotImplemented = (connection: Types.ConnectionType) => {
  connection.onMyNodeInfo.subscribe((nodeInfo) => {
    console.log("myNodeInfoPacket", nodeInfo);
  });
};

const createConnection = async (id: number): Promise<ISerialConnection> => {
  const connection = new ISerialConnection(id);
  const serialPort = await navigator.serial.requestPort();

  await connection.connect({
    port: serialPort,
    baudRate: undefined,
    concurrentLogOutput: true,
  });

  return connection;
};

function* subscribeAll(deviceId: number, connection: ISerialConnection) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceMetadataPacketChannel: DeviceMetadataPacketChannel = yield call(
    createDeviceMetadataPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const routingPacketChannel: RoutingPacketChannel = yield call(
    createRoutingPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const telemetryPacketChannel: TelemetryPacketChannel = yield call(
    createTelemetryPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceStatusPacketChannel: DeviceStatusChannel = yield call(
    createDeviceStatusPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const positionPacketChannel: PostionPacketChannel = yield call(
    createPositionPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const waypointPacketChannel: WaypointPacketChannel = yield call(
    createWaypointPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const userPacketChannel: UserPacketChannel = yield call(
    createUserPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const nodeInfoPacketChannel: NodeInfoPacketChannel = yield call(
    createNodeInfoPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const channelPacketChannel: ChannelPacketChannel = yield call(
    createChannelPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const configPacketChannel: ConfigPacketChannel = yield call(
    createConfigPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const moduleConfigPacketChannel: ModuleConfigPacketChannel = yield call(
    createModuleConfigPacketChannel,
    connection
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const messagePacketChannel: MessagePacketChannel = yield call(
    createMessagePacketChannel,
    connection
  );

  yield all([
    call(
      handleDeviceMetadataPacketChannel,
      deviceId,
      deviceMetadataPacketChannel
    ),
    call(handleRoutingPacketChannel, deviceId, routingPacketChannel),
    call(handleTelemetryPacketChannel, deviceId, telemetryPacketChannel),
    call(handleDeviceStatusPacketChannel, deviceId, deviceStatusPacketChannel),
    call(handlePositionPacketChannel, deviceId, positionPacketChannel),
    call(handleWaypointPacketChannel, deviceId, waypointPacketChannel),
    call(handleUserPacketChannel, deviceId, userPacketChannel),
    call(handleNodeInfoPacketChannel, deviceId, nodeInfoPacketChannel),
    call(handleChannelPacketChannel, deviceId, channelPacketChannel),
    call(handleConfigPacketChannel, deviceId, configPacketChannel),
    call(handleModuleConfigPacketChannel, deviceId, moduleConfigPacketChannel),
    call(handleMessageChannel, deviceId, messagePacketChannel),
  ]);
}

function* createDeviceWorker(action: ReturnType<typeof createDeviceAction>) {
  try {
    const deviceId = action.payload;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const connection: ISerialConnection = yield call(
      createConnection,
      deviceId
    );
    connection.setLogLevel(Protobuf.LogRecord_Level.TRACE);

    // Device needs to be created before subscriptions
    yield put(deviceSliceActions.createDevice(deviceId));

    // Subscribe to device serial events
    yield call(subscribeAll, deviceId, connection);
    yield call(subscribeNotImplemented, connection);
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

export function* watchCreateDevice() {
  yield all([takeEvery(createDeviceAction.type, createDeviceWorker)]);
}
