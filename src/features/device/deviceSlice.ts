/* eslint-disable no-param-reassign */
import { Protobuf, Types } from "@meshtastic/meshtasticjs";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  ChannelPacket,
  ConfigPacket,
  DeviceMetadataPacket,
  DeviceStatusPacket,
  MessagePacket,
  ModuleConfigPacket,
  NodeInfoPacket,
  PositionPacket,
  UserPacket,
  WaypointPacket,
} from "@features/device/deviceConnectionHandlerSagas";

export interface MessageWithAck extends Types.MessagePacket {
  ack: boolean;
}

export interface WaypointIDWithAck extends Omit<Types.WaypointPacket, "data"> {
  waypointID: number;
  ack: boolean;
}

export type AllMessageTypes = MessageWithAck | WaypointIDWithAck;

export interface IChannel {
  config: Protobuf.Channel;
  lastInterraction: Date;
  messages: AllMessageTypes[];
}

export interface INode {
  deviceMetrics: (Protobuf.DeviceMetrics & { timestamp: Date })[];
  environmentMetrics: (Protobuf.EnvironmentMetrics & { timestamp: Date })[];
  metadata?: Protobuf.DeviceMetadata;
  data: Protobuf.NodeInfo;
}

export interface IDevice {
  id: number;
  // hardware: Protobuf.MyNodeInfo;
  nodes: INode[];
  activePeer: number;
  regionUnset: boolean;
  currentMetrics: Protobuf.DeviceMetrics;

  deviceMetadata: DeviceMetadataPacket["data"] | null;
  deviceStatus: DeviceStatusPacket;
  position: PositionPacket["data"] | null;
  waypoints: Record<string, WaypointPacket["data"]>;
  user: UserPacket["data"] | null;
  nodeInfo: NodeInfoPacket["data"] | null;
  channels: Record<number, ChannelPacket["data"]>;
  config: ConfigPacket["data"] | null;
  moduleConfig: ModuleConfigPacket["data"] | null;
  messages: { [channel: number]: MessagePacket["text"][] };
}

export interface IDeviceState {
  devices: Record<number, IDevice>;
}

export const initialDeviceState = {
  devices: {},
};

export const deviceSlice = createSlice({
  name: "devices",
  initialState: initialDeviceState as IDeviceState,
  reducers: {
    createDevice: (state, action: PayloadAction<number>) => {
      const deviceId = action.payload;
      console.log("deviceId", deviceId);
      if (state.devices[deviceId]) return;

      const newDevice: IDevice = {
        id: deviceId,
        // hardware: Protobuf.MyNodeInfo.create(),
        nodes: [],
        activePeer: 0,
        regionUnset: false,
        currentMetrics: Protobuf.DeviceMetrics.create(),
        deviceMetadata: null,
        deviceStatus: 0,
        position: null,
        waypoints: {},
        user: null,
        nodeInfo: null,
        channels: {},
        config: null,
        moduleConfig: null,
        messages: {},
      };

      state.devices[deviceId] = newDevice;
    },
    removeDevice: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      delete state.devices[id];
    },
    updateDeviceMetadata: (
      state,
      action: PayloadAction<{ deviceId: number; packet: DeviceMetadataPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].deviceMetadata = packet.data;
    },
    updateDeviceStatus: (
      state,
      action: PayloadAction<{ deviceId: number; packet: DeviceStatusPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].deviceStatus = packet;
    },
    updateDevicePositon: (
      state,
      action: PayloadAction<{ deviceId: number; packet: PositionPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].position = packet.data;
    },
    addDeviceWaypoint: (
      state,
      action: PayloadAction<{ deviceId: number; packet: WaypointPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].waypoints[packet.data.id] = packet.data;
    },
    updateDeviceUser: (
      state,
      action: PayloadAction<{ deviceId: number; packet: UserPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].user = packet.data;
    },
    updateDeviceNodeInfo: (
      state,
      action: PayloadAction<{ deviceId: number; packet: NodeInfoPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].nodeInfo = packet.data;
    },
    addDeviceChannel: (
      state,
      action: PayloadAction<{ deviceId: number; packet: ChannelPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].channels[packet.data.index] = packet.data;
    },
    updateDeviceConfig: (
      state,
      action: PayloadAction<{ deviceId: number; packet: ConfigPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].config = packet.data;
    },
    updateDeviceModuleConfig: (
      state,
      action: PayloadAction<{ deviceId: number; packet: ModuleConfigPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].moduleConfig = packet.data;
    },
    addDeviceMessage: (
      state,
      action: PayloadAction<{ deviceId: number; packet: MessagePacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      const currMessages =
        state.devices[deviceId].messages[packet.packet.channel] ?? [];
      state.devices[deviceId].messages[packet.packet.channel] = [
        ...currMessages,
        packet.text,
      ];
    },
  },
});

export const { actions: deviceSliceActions, reducer: deviceReducer } =
  deviceSlice;
