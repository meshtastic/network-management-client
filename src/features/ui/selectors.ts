import type { RootState } from "@app/store";

import type {
  app_device_MeshNode,
  app_device_NormalizedWaypoint,
} from "@bindings/index";

import {
  selectNodeById,
  selectWaypointById,
} from "@features/device/deviceSelectors";

export const selectRootState = () => (state: RootState) => state;

export const selectActiveNodeId = () => (state: RootState) =>
  state.ui.activeNode;

export const selectActiveNode =
  () =>
  (state: RootState): app_device_MeshNode | null => {
    const activeNodeId = selectActiveNodeId()(state);
    if (!activeNodeId) return null;
    return selectNodeById(activeNodeId)(state);
  };

// Get ID of the active waypoint
export const selectActiveWaypointId = () => (state: RootState) =>
  state.ui.activeWaypoint;

// Get actual Waypoint object
export const selectActiveWaypoint =
  () =>
  (state: RootState): app_device_NormalizedWaypoint | null => {
    const activeID = selectActiveWaypointId()(state);
    if (activeID === null) return null;
    return selectWaypointById(activeID)(state);
  };

// What info pane are we showing
export const selectInfoPane = () => (state: RootState) => state.ui.infoPane;
