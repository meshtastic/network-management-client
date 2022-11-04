/* eslint-disable no-param-reassign */
import { Protobuf, Types } from "@meshtastic/meshtasticjs";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  ready: boolean;
  status: Types.DeviceStatusEnum;
  channels: IChannel[];
  config: Protobuf.LocalConfig;
  moduleConfig: Protobuf.LocalModuleConfig;
  hardware: Protobuf.MyNodeInfo;
  nodes: INode[];
  activePeer: number;
  waypoints: Protobuf.Waypoint[];
  regionUnset: boolean;
  currentMetrics: Protobuf.DeviceMetrics;
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
      const id = action.payload;
      if (state.devices[id]) return;

      const newDevice: IDevice = {
        id,
        ready: false,
        status: Types.DeviceStatusEnum.DEVICE_DISCONNECTED,
        channels: [],
        config: Protobuf.LocalConfig.create(),
        moduleConfig: Protobuf.LocalConfig.create(),
        hardware: Protobuf.MyNodeInfo.create(),
        nodes: [],
        activePeer: 0,
        waypoints: [],
        regionUnset: false,
        currentMetrics: Protobuf.DeviceMetrics.create(),
      };

      state.devices[id] = newDevice;
    },
    removeDevice: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      delete state.devices[id];
    },
  },
});

export const { actions: deviceActions, reducer: deviceReducer } = deviceSlice;
