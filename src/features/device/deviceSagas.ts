import { all, call, put, take, takeEvery } from "redux-saga/effects";
import { Types, Protobuf, ISerialConnection } from "@meshtastic/meshtasticjs";

import { createDeviceAction } from "@features/device/deviceActions";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { EventChannel, eventChannel } from "redux-saga";

export type PositionMessageData = Types.PositionPacket["data"];
type PostionMessageChannel = EventChannel<PositionMessageData>;

const createPositionMessageChannel = (
  connection: Types.ConnectionType
): PostionMessageChannel => {
  return eventChannel((emitter) => {
    connection.onPositionPacket.subscribe((position) => {
      console.log("initial position message", position);
      emitter(position.data);
    });

    return () => null;
  });
};

function* handlePositionMessageChannel(
  deviceId: number,
  channel: PostionMessageChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message: PositionMessageData = yield take(channel);
      yield put(
        deviceSliceActions.updateDevicePositon({ id: deviceId, data: message })
      );
    }
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

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
  const serialPort = await navigator.serial.requestPort();

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

    yield call(subscribeAll, connection);
    yield put(deviceSliceActions.createDevice(id));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const positionChannel: PostionMessageChannel = yield call(
      createPositionMessageChannel,
      connection
    );

    yield all([call(handlePositionMessageChannel, id, positionChannel)]);
  } catch (error) {
    yield put({ type: "GENERAL_ERROR", payload: error });
  }
}

export function* watchCreateDevice() {
  yield all([takeEvery(createDeviceAction.type, createDeviceWorker)]);
}
