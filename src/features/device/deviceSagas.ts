import { all, call, fork, put, takeEvery } from "redux-saga/effects";

import {
  ChannelChannel,
  ConfigChannel,
  createChannelChannel,
  createConfigChannel,
  createDeviceMetadataChannel,
  createDeviceStatusChannel,
  createMessageChannel,
  createMeshPacketsChannel,
  createModuleConfigChannel,
  createNodeInfoChannel,
  createPositionChannel,
  createRoutingChannel,
  createTelemetryChannel,
  createUserChannel,
  createWaypointChannel,
  DeviceMetadataChannel,
  DeviceStatusChannel,
  handleChannelChannel,
  handleConfigChannel,
  handleDeviceMetadataChannel,
  handleDeviceStatusChannel,
  handleMessageChannel,
  handleMeshPacketsChannel,
  handleModuleConfigChannel,
  handleNodeInfoChannel,
  handlePositionChannel,
  handleRoutingChannel,
  handleTelemetryChannel,
  handleUserChannel,
  handleWaypointChannel,
  MessageChannel,
  MeshPacketChannel,
  ModuleConfigChannel,
  NodeInfoChannel,
  PostionChannel,
  RoutingChannel,
  TelemetryChannel,
  UserChannel,
  WaypointChannel,
} from "@features/device/deviceConnectionHandlerSagas";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestCreateDeviceAction } from "@features/device/deviceActions";

// const subscribeNotImplemented = () => {
//   connection.onMyNodeInfo.subscribe((nodeInfo) => {
//     console.log("myNodeInfoPacket", nodeInfo);
//   });
// };

function* subscribeAll(deviceId: number) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceMetadataPacketChannel: DeviceMetadataChannel = yield call(
    createDeviceMetadataChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const routingPacketChannel: RoutingChannel = yield call(createRoutingChannel);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const telemetryPacketChannel: TelemetryChannel = yield call(
    createTelemetryChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const deviceStatusPacketChannel: DeviceStatusChannel = yield call(
    createDeviceStatusChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const positionPacketChannel: PostionChannel = yield call(
    createPositionChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const waypointPacketChannel: WaypointChannel = yield call(
    createWaypointChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const userPacketChannel: UserChannel = yield call(createUserChannel);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const nodeInfoPacketChannel: NodeInfoChannel = yield call(
    createNodeInfoChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const channelPacketChannel: ChannelChannel = yield call(createChannelChannel);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const configPacketChannel: ConfigChannel = yield call(createConfigChannel);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const moduleConfigPacketChannel: ModuleConfigChannel = yield call(
    createModuleConfigChannel
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const messagePacketChannel: MessageChannel = yield call(createMessageChannel);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const messagesPacketChannel: MeshPacketChannel = yield call(
    createMeshPacketsChannel
  );

  yield all([
    call(handleDeviceMetadataChannel, deviceId, deviceMetadataPacketChannel),
    call(handleRoutingChannel, deviceId, routingPacketChannel),
    call(handleTelemetryChannel, deviceId, telemetryPacketChannel),
    call(handleDeviceStatusChannel, deviceId, deviceStatusPacketChannel),
    call(handlePositionChannel, deviceId, positionPacketChannel),
    call(handleWaypointChannel, deviceId, waypointPacketChannel),
    call(handleUserChannel, deviceId, userPacketChannel),
    call(handleNodeInfoChannel, deviceId, nodeInfoPacketChannel),
    call(handleChannelChannel, deviceId, channelPacketChannel),
    call(handleConfigChannel, deviceId, configPacketChannel),
    call(handleModuleConfigChannel, deviceId, moduleConfigPacketChannel),
    call(handleMessageChannel, deviceId, messagePacketChannel),
    call(handleMeshPacketsChannel, deviceId, messagesPacketChannel),
  ]);
}

function* createDeviceWorker(
  action: ReturnType<typeof deviceSliceActions["createDevice"]>
) {
  try {
    const deviceId = action.payload;

    __TAURI_INVOKE__("get_all_serial_ports")
      .then(console.log)
      .catch(console.error);

    __TAURI_INVOKE__("connect_to_serial_port", { portName: "/dev/ttyACM0" })
      .then(console.log)
      .catch(console.error);

    __TAURI_INVOKE__("send_text", { text: "device initialized" })
      .then(console.log)
      .catch(console.error);

    // Device needs to be created before subscriptions
    yield put(deviceSliceActions.createDevice(deviceId));

    // Subscribe to device serial events
    yield call(subscribeAll, deviceId);
    // yield call(subscribeNotImplemented, connection);
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

export function* watchCreateDevice() {
  yield takeEvery(requestCreateDeviceAction.type, createDeviceWorker);
}

export function* devicesSaga() {
  yield all([fork(watchCreateDevice)]);
}
