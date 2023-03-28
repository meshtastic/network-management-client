import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MeshDevice } from "@bindings/MeshDevice";
import type { MeshNode } from "@bindings/MeshNode";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

export interface IDeviceState {
  device: MeshDevice | null;
  activeNode: MeshNode["data"]["num"] | null;
  availableSerialPorts: string[] | null;
  activeSerialPort: string | null;
  activeWaypoint: Waypoint | null;
  allowOnMapWaypointCreation: boolean; // If true, we can create new waypoints from the map
  infoPane: "waypoint" | "waypointEdit" | "algos" | null;
}

export const initialDeviceState: IDeviceState = {
  device: null,
  activeNode: null,
  availableSerialPorts: null,
  activeSerialPort: null,
  activeWaypoint: null,
  allowOnMapWaypointCreation: false,
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

    setActiveSerialPort: (state, action: PayloadAction<string | null>) => {
      state.activeSerialPort = action.payload;
    },

    setDevice: (state, action: PayloadAction<MeshDevice | null>) => {
      state.device = action.payload;
    },

    setActiveNode: (
      state,
      action: PayloadAction<MeshNode["data"]["num"] | null>
    ) => {
      state.activeNode = action.payload;
      if (action.payload) {
        // If whatever is passed in when this is called is not null
        state.activeWaypoint = null;
        state.infoPane = null;
      }
    },

    setActiveWaypoint: (state, action: PayloadAction<Waypoint | null>) => {
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

    setAllowOnMapWaypointCreation: (state, action: PayloadAction<boolean>) => {
      state.allowOnMapWaypointCreation = action.payload;
    },
  },
});

export const { actions: deviceSliceActions, reducer: deviceReducer } =
  deviceSlice;
