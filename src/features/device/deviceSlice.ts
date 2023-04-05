import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MeshDevice } from "@bindings/MeshDevice";
import type { MeshNode } from "@bindings/MeshNode";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

export interface IDeviceState {
  device: MeshDevice | null;
  activeNode: MeshNode["data"]["num"] | null;
  availableSerialPorts: string[] | null;
  activeSerialPort: string | null;
  activeWaypoint: Waypoint["id"] | null;
  allowOnMapWaypointCreation: boolean; // If true, we can create new waypoints from the map
  autoConnectPort: string | null; // Port to automatically connect to on startup
  placeholderWaypoint: Waypoint | null;
  infoPane: "waypoint" | "waypointEdit" | "algos" | null;
}

export const initialDeviceState: IDeviceState = {
  device: null,
  activeNode: null,
  availableSerialPorts: null,
  activeSerialPort: null,
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
      action: PayloadAction<string[] | null>,
    ) => {
      state.availableSerialPorts = action.payload;
    },

    setActiveSerialPort: (state, action: PayloadAction<string | null>) => {
      state.activeSerialPort = action.payload;
    },

    setDevice: (state, action: PayloadAction<MeshDevice | null>) => {
      state.device = action.payload;
    },

    setActiveNode: (
      state,
      action: PayloadAction<MeshNode["data"]["num"] | null>,
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
      action: PayloadAction<Waypoint["id"] | null>,
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
      action: PayloadAction<"waypoint" | "waypointEdit" | "algos" | null>,
    ) => {
      state.infoPane = action.payload;

      if (action.payload) {
        state.activeNode = null;
      } else {
        state.activeWaypoint = null;
      }
    },

    setPlaceholderWaypoint: (state, action: PayloadAction<Waypoint | null>) => {
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
