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
  waypointEdit: boolean; // Controls if the waypoint edit menu, or the normal menu shows up on map
  allowOnMapWaypointCreation: boolean; // If true, we can create new waypoints from the map
  showAlgosAccordion : boolean;
}

export const initialDeviceState: IDeviceState = {
  device: null,
  activeNode: null,
  availableSerialPorts: null,
  activeSerialPort: null,
  activeWaypoint: null,
  waypointEdit: false,
  allowOnMapWaypointCreation: false,
  showAlgosAccordion : true,
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
        state.showAlgosAccordion = false;
      }
    },

    setActiveWaypoint: (
      state,
      action: PayloadAction<Waypoint["id"] | null>
    ) => {
      state.activeWaypoint = action.payload;
      if (action.payload) {
        // If whatever is passed in when this is called is not null; want only one active of either node, wp, or accordion
        state.activeNode = null;
        state.showAlgosAccordion = false;
        // Only want edit to be true if someone explicitly clicks on edit; prevent holdover from exiting previous node exit
        state.waypointEdit = false;
        
      }
    },

    setWaypointEdit: (state, action: PayloadAction<boolean>) => {
      state.waypointEdit = action.payload;
    },

    setAllowOnMapWaypointCreation: (state, action: PayloadAction<boolean>) => {
      state.allowOnMapWaypointCreation = action.payload;
    },

    setShowAlgosAccordion: (state, action: PayloadAction<boolean>) => {
      state.showAlgosAccordion = action.payload;
      if (action.payload) {
        state.activeNode = null;
        state.activeWaypoint = null;
      }


    }
}});

export const { actions: deviceSliceActions, reducer: deviceReducer } =
  deviceSlice;
