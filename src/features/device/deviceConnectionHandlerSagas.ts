import { EventChannel, eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import type { Types } from "@meshtastic/meshtasticjs";
import { listen } from "@tauri-apps/api/event";

import { deviceSliceActions } from "@features/device/deviceSlice";

export type DeviceMetadata = Types.DeviceMetadataPacket["data"];
export type Routing = Types.RoutingPacket["data"];
export type Telemetry = Types.TelemetryPacket["data"];
export type DeviceStatus = Types.DeviceStatusEnum;
export type Position = Types.PositionPacket["data"];
export type Waypoint = Types.WaypointPacket["data"];
export type User = Types.UserPacket["data"];
export type NodeInfo = Types.NodeInfoPacket["data"];
export type Channel = Types.ChannelPacket["data"];
export type Config = Types.ConfigPacket["data"];
export type ModuleConfig = Types.ModuleConfigPacket["data"];
export type Message = Types.MessagePacket["text"];
export type Messages =
  | Types.DeviceMetadataPacket
  | Types.RoutingPacket
  | Types.TelemetryPacket
  | Types.DeviceStatusEnum
  | Types.PositionPacket
  | Types.WaypointPacket
  | Types.UserPacket
  | Types.NodeInfoPacket
  | Types.ChannelPacket
  | Types.ConfigPacket
  | Types.ModuleConfigPacket
  | Types.MessagePacket;

export type DeviceMetadataChannel = EventChannel<DeviceMetadata>;
export type RoutingChannel = EventChannel<Routing>;
export type TelemetryChannel = EventChannel<Telemetry>;
export type DeviceStatusChannel = EventChannel<DeviceStatus>;
export type PostionChannel = EventChannel<Position>;
export type WaypointChannel = EventChannel<Waypoint>;
export type UserChannel = EventChannel<User>;
export type NodeInfoChannel = EventChannel<NodeInfo>;
export type ChannelChannel = EventChannel<Channel>;
export type ConfigChannel = EventChannel<Config>;
export type ModuleConfigChannel = EventChannel<ModuleConfig>;
export type MessageChannel = EventChannel<Message>;
export type MessagesChannel = EventChannel<Messages[]>;

function* handleSagaError(error: unknown) {
  yield put({ type: "GENERAL_ERROR", payload: error });
}

export const createDeviceMetadataChannel = (): DeviceMetadataChannel => {
  return eventChannel((emitter) => {
    // connection.onDeviceMetadataPacket.subscribe((packet) => {
    //   emitter(packet);
    // });

    return () => null;
  });
};

export function* handleDeviceMetadataChannel(
  deviceId: number,
  channel: DeviceMetadataChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: DeviceMetadata = yield take(channel);
      // yield put(deviceSliceActions.updateDeviceMetadata({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createRoutingChannel = (): RoutingChannel => {
  return eventChannel((emitter) => {
    listen<Routing>("routing", (event) => {
      console.log("routing", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleRoutingChannel(
  deviceId: number,
  channel: RoutingChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: Routing = yield take(channel);
      console.log("routingPacket", deviceId, packet);
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createTelemetryChannel = (): TelemetryChannel => {
  return eventChannel((emitter) => {
    listen<Telemetry>("telemetry", (event) => {
      console.log("telemetry", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleTelemetryChannel(
  deviceId: number,
  channel: TelemetryChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: Telemetry = yield take(channel);
      console.log("telemetryPacket", deviceId, packet);
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createDeviceStatusChannel = (): DeviceStatusChannel => {
  return eventChannel((emitter) => {
    // connection.onDeviceStatus.subscribe((packet) => {
    //   emitter(packet);
    // });

    return () => null;
  });
};

export function* handleDeviceStatusChannel(
  deviceId: number,
  channel: DeviceStatusChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: DeviceStatus = yield take(channel);
      // yield put(deviceSliceActions.updateDeviceStatus({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createPositionChannel = (): PostionChannel => {
  return eventChannel((emitter) => {
    listen<Position>("position", (event) => {
      console.log("position", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handlePositionChannel(
  deviceId: number,
  channel: PostionChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: Position = yield take(channel);
      // yield put(deviceSliceActions.updateNodePosition({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createWaypointChannel = (): WaypointChannel => {
  return eventChannel((emitter) => {
    // connection.onWaypointPacket.subscribe((packet) => {
    //   emitter(packet);
    // });

    return () => null;
  });
};

export function* handleWaypointChannel(
  deviceId: number,
  channel: WaypointChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: Waypoint = yield take(channel);
      // yield put(deviceSliceActions.addDeviceWaypoint({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

// TODO myNodeInfo

export const createUserChannel = (): UserChannel => {
  return eventChannel((emitter) => {
    // connection.onUserPacket.subscribe((packet) => {
    //   emitter(packet);
    // });

    return () => null;
  });
};

export function* handleUserChannel(deviceId: number, channel: UserChannel) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: User = yield take(channel);
      // yield put(deviceSliceActions.updateNodeUser({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createNodeInfoChannel = (): NodeInfoChannel => {
  return eventChannel((emitter) => {
    listen<NodeInfo>("node_info", (event) => {
      console.log("node_info", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleNodeInfoChannel(
  deviceId: number,
  channel: NodeInfoChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: NodeInfo = yield take(channel);
      // yield put(deviceSliceActions.updateNodeInfo({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createChannelChannel = (): ChannelChannel => {
  return eventChannel((emitter) => {
    listen<Channel>("channel", (event) => {
      console.log("channel", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleChannelChannel(
  deviceId: number,
  channel: ChannelChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: Channel = yield take(channel);
      // yield put(deviceSliceActions.addDeviceChannel({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createConfigChannel = (): ConfigChannel => {
  return eventChannel((emitter) => {
    listen<Config>("config", (event) => {
      console.log("config", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleConfigChannel(deviceId: number, channel: ConfigChannel) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: Config = yield take(channel);
      // yield put(deviceSliceActions.updateDeviceConfig({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createModuleConfigChannel = (): ModuleConfigChannel => {
  return eventChannel((emitter) => {
    listen<ModuleConfig>("module_config", (event) => {
      console.log("module_config", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleModuleConfigChannel(
  deviceId: number,
  channel: ModuleConfigChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: ModuleConfig = yield take(channel);
      // yield put(
      //   deviceSliceActions.updateDeviceModuleConfig({ deviceId, packet })
      // );
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createMessageChannel = (): MessageChannel => {
  return eventChannel((emitter) => {
    listen<string>("text", (event) => {
      console.log("text", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleMessageChannel(
  deviceId: number,
  channel: MessageChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: Message = yield take(channel);
      // yield put(deviceSliceActions.addDeviceMessage({ deviceId, packet }));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createMessagesChannel = (): MessagesChannel => {
  return eventChannel((emitter) => {
    listen<Messages[]>("message_update", (event) => {
      // console.log("message_update", event.payload);
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleMessagesChannel(
  deviceId: number,
  channel: MessagesChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packet: { messages: Messages[] } = yield take(channel);

      yield put(
        deviceSliceActions.updateMessages({
          deviceId,
          messages: packet.messages,
        })
      );
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}
