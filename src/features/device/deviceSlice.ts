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
  TelemetryPacket,
  UserPacket,
  WaypointPacket,
} from "@features/device/deviceConnectionHandlerSagas";
import { selectNodeById } from "@features/device/deviceSelectors";

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
  nodes: Record<number, INode>;
  activePeer: number;
  regionUnset: boolean;
  currentMetrics: Protobuf.DeviceMetrics;

  // deviceMetadata: DeviceMetadataPacket["data"] | null; // external
  deviceStatus: DeviceStatusPacket;
  waypoints: Record<string, WaypointPacket["data"]>;
  // user: UserPacket["data"] | null;
  // nodeInfo: NodeInfoPacket["data"] | null; // external
  channels: Record<number, ChannelPacket["data"]>;
  config: ConfigPacket["data"] | null;
  moduleConfig: ModuleConfigPacket["data"] | null;
  messages: { [channel: number]: MessagePacket["text"][] };
}

export interface IDeviceState {
  devices: Record<number, IDevice>;
  activeNode: INode["data"]["num"] | null;
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
        nodes: {},
        activePeer: 0,
        regionUnset: false,
        currentMetrics: Protobuf.DeviceMetrics.create(),
        // deviceMetadata: null,
        deviceStatus: 0,
        waypoints: {},
        // user: null,
        // nodeInfo: null,
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
      const device = state.devices[deviceId];
      if (!device) return;

      const foundNode = device.nodes[packet.packet.from];

      if (foundNode) {
        foundNode.metadata = packet.data;
        return;
      }

      console.warn("Node not found!");
    },
    updateNodeMetrics: (
      state,
      action: PayloadAction<{ deviceId: number; packet: TelemetryPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      const device = state.devices[deviceId];
      if (!device) return;

      let foundNode = device.nodes[packet.packet.from];

      if (foundNode && !foundNode) {
        foundNode = {
          data: Protobuf.NodeInfo.create({
            num: packet.packet.from,
            snr: packet.packet.rxSnr,
            lastHeard: new Date().getSeconds(),
          }),
          metadata: undefined,
          deviceMetrics: [],
          environmentMetrics: [],
        };

        device.nodes[packet.packet.from] = foundNode;
      }

      if (foundNode) {
        switch (packet.data.variant.oneofKind) {
          case "deviceMetrics":
            if (device) {
              if (packet.data.variant.deviceMetrics.batteryLevel) {
                device.currentMetrics.batteryLevel =
                  packet.data.variant.deviceMetrics.batteryLevel;
              }
              if (packet.data.variant.deviceMetrics.voltage) {
                device.currentMetrics.voltage =
                  packet.data.variant.deviceMetrics.voltage;
              }
              if (packet.data.variant.deviceMetrics.airUtilTx) {
                device.currentMetrics.airUtilTx =
                  packet.data.variant.deviceMetrics.airUtilTx;
              }
              if (packet.data.variant.deviceMetrics.channelUtilization) {
                device.currentMetrics.channelUtilization =
                  packet.data.variant.deviceMetrics.channelUtilization;
              }
            }

            foundNode.deviceMetrics.push({
              ...packet.data.variant.deviceMetrics,
              timestamp:
                packet.packet.rxTime === 0
                  ? new Date()
                  : new Date(packet.packet.rxTime * 1000),
            });
            break;

          case "environmentMetrics":
            foundNode.environmentMetrics.push({
              ...packet.data.variant.environmentMetrics,
              timestamp:
                packet.packet.rxTime === 0
                  ? new Date()
                  : new Date(packet.packet.rxTime * 1000),
            });
            break;

          default:
            break;
        }
      }
    },
    updateDeviceStatus: (
      state,
      action: PayloadAction<{ deviceId: number; packet: DeviceStatusPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].deviceStatus = packet;
    },
    updateNodePosition: (
      state,
      action: PayloadAction<{ deviceId: number; packet: PositionPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      const device = state.devices[deviceId];
      if (!device) return;

      const foundNode = device.nodes[packet.packet.from];

      if (foundNode) {
        foundNode.data.position = packet.data;
        return;
      }

      device.nodes[packet.packet.from] = {
        data: Protobuf.NodeInfo.create({
          num: packet.packet.from,
          position: packet.data,
        }),
        metadata: undefined,
        deviceMetrics: [],
        environmentMetrics: [],
      };
    },
    addDeviceWaypoint: (
      state,
      action: PayloadAction<{ deviceId: number; packet: WaypointPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      if (!state.devices[deviceId]) return;
      state.devices[deviceId].waypoints[packet.data.id] = packet.data;
    },
    updateNodeUser: (
      state,
      action: PayloadAction<{ deviceId: number; packet: UserPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      const device = state.devices[deviceId];
      if (!device) return;

      const foundNode = device.nodes[packet.packet.from];

      if (foundNode) {
        foundNode.data.user = packet.data;
        return;
      }

      device.nodes[packet.packet.from] = {
        data: Protobuf.NodeInfo.create({
          num: packet.packet.from,
          snr: packet.packet.rxSnr,
          user: packet.data,
        }),
        metadata: undefined,
        deviceMetrics: [],
        environmentMetrics: [],
      };
    },
    updateNodeInfo: (
      state,
      action: PayloadAction<{ deviceId: number; packet: NodeInfoPacket }>
    ) => {
      const { deviceId, packet } = action.payload;
      const device = state.devices[deviceId];
      if (!device) return;

      const foundNode = device.nodes[packet.data.num];

      if (foundNode) {
        foundNode.data = packet.data;
        return;
      }

      device.nodes[packet.data.num] = {
        data: Protobuf.NodeInfo.create(packet.data),
        metadata: undefined,
        deviceMetrics: [],
        environmentMetrics: [],
      };
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
    setActiveNode: (state, action: PayloadAction<number | null>) => {
      const nodeId = action.payload;

      if (!nodeId) {
        state.activeNode = null;
        return;
      }

      const foundNode = selectNodeById(nodeId);
      if (!foundNode) return;

      state.activeNode = nodeId;
    },
  },
});

export const { actions: deviceSliceActions, reducer: deviceReducer } =
  deviceSlice;
