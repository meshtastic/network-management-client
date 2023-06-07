import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type {
  app_device_MeshDevice,
  app_device_MeshNode,
  app_protobufs_Waypoint,
} from "@bindings/index";

export interface IDeviceState {
  device: app_device_MeshDevice | null;
  activeNode: app_device_MeshNode["data"]["num"] | null;
  availableSerialPorts: string[] | null;
  primarySerialPort: string | null;
  primarySocketAddress: string | null;
  activeWaypoint: app_protobufs_Waypoint["id"] | null;
  allowOnMapWaypointCreation: boolean; // If true, we can create new waypoints from the map
  autoConnectPort: string | null; // Port to automatically connect to on startup
  placeholderWaypoint: app_protobufs_Waypoint | null;
  infoPane: "waypoint" | "waypointEdit" | "algos" | null;
}

export const initialDeviceState: IDeviceState = {
  device: null,
  activeNode: null,
  availableSerialPorts: null,
  primarySerialPort: null,
  primarySocketAddress: null,
  activeWaypoint: null,
  allowOnMapWaypointCreation: false,
  autoConnectPort: null,
  placeholderWaypoint: null,
  infoPane: null,
};

export const deviceSlice = createSlice({
  name: "device",
  initialState: initialDeviceState,
  reducers: {
    setAvailableSerialPorts: (
      state,
      action: PayloadAction<string[] | null>
    ) => {
      state.availableSerialPorts = action.payload;
    },

    setPrimarySerialPort: (state, action: PayloadAction<string | null>) => {
      state.primarySerialPort = action.payload;
    },

    setPrimarySocketAddress: (state, action: PayloadAction<string | null>) => {
      state.primarySocketAddress = action.payload;
    },

    setDevice: (state, action: PayloadAction<app_device_MeshDevice | null>) => {
      state.device = action.payload;
    },

    setActiveNode: (
      state,
      action: PayloadAction<app_device_MeshNode["data"]["num"] | null>
    ) => {
      state.activeNode = action.payload;
      if (action.payload) {
        // If whatever is passed in when this is called is not null
        state.activeWaypoint = null;
        state.infoPane = null;
      }
    },

    setActiveWaypoint: (
      state,
      action: PayloadAction<app_protobufs_Waypoint["id"] | null>
    ) => {
      state.activeWaypoint = action.payload;
      if (action.payload) {
        // If there is an active waypoint then we don't want another info screen
        state.infoPane = "waypoint";
        state.activeNode = null;
      }
    },

    setInfoPane: (
      state,
      action: PayloadAction<"waypoint" | "waypointEdit" | "algos" | null>
    ) => {
      state.infoPane = action.payload;

      if (action.payload) {
        state.activeNode = null;
      } else {
        state.activeWaypoint = null;
      }
    },

    setPlaceholderWaypoint: (
      state,
      action: PayloadAction<app_protobufs_Waypoint | null>
    ) => {
      state.placeholderWaypoint = action.payload;
    },

    setAllowOnMapWaypointCreation: (state, action: PayloadAction<boolean>) => {
      state.allowOnMapWaypointCreation = action.payload;
    },

    setAutoConnectPort: (state, action: PayloadAction<string | null>) => {
      state.autoConnectPort = action.payload;
    },
  },
});

export const { actions: deviceSliceActions, reducer: deviceReducer } =
  deviceSlice;
