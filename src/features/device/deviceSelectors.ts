import type { RootState } from "@app/store";

import type {
  app_device_MeshDevice,
  app_device_MeshNode,
  app_protobufs_User,
  app_device_MeshChannel,
  app_protobufs_Waypoint,
} from "@bindings/index";

export const selectRootState = () => (state: RootState) => state;

export const selectAvailablePorts =
  () =>
  (state: RootState): string[] | null =>
    state.devices.availableSerialPorts;

export const selectPrimaryDeviceKey =
  () =>
  (state: RootState): string | null =>
    state.devices.primaryDeviceKey;

export const selectDevice =
  () =>
  (state: RootState): app_device_MeshDevice | null =>
    state.devices.device;

export const selectConnectedDeviceNodeId =
  () =>
  (state: RootState): number | null =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    state.devices.device?.myNodeInfo.myNodeNum ?? null;

export const selectDeviceConnected =
  () =>
  (state: RootState): boolean =>
    !!state.devices.device;

export const selectAllNodes =
  () =>
  (state: RootState): app_device_MeshNode[] =>
    Object.values(state.devices.device?.nodes ?? []);

export const selectNodeById =
  (id: number | null) =>
  (state: RootState): app_device_MeshNode | null =>
    id ? selectAllNodes()(state).find((n) => n.data.num === id) ?? null : null;

export const selectActiveNodeId = () => (state: RootState) =>
  state.devices.activeNode;

export const selectActiveNode =
  () =>
  (state: RootState): app_device_MeshNode | null => {
    const activeNodeId = selectActiveNodeId()(state);
    if (!activeNodeId) return null;
    return selectNodeById(activeNodeId)(state);
  };

export const selectAllUsersByNodeIds =
  () =>
  (state: RootState): Record<number, app_protobufs_User | null> =>
    selectAllNodes()(state).reduce((accum, n) => {
      const user = n.data.user;
      return user ? { ...accum, [n.data.num]: user } : accum;
    }, [] as app_protobufs_User[]);

export const selectUserByNodeId =
  (nodeId: number) =>
  (state: RootState): app_protobufs_User | null =>
    selectNodeById(nodeId)(state)?.data.user ?? null;

export const selectDeviceChannels =
  () =>
  (state: RootState): app_device_MeshChannel[] =>
    Object.values(selectDevice()(state)?.channels ?? []);

// Returns list of all waypoints on connected node
export const selectAllWaypoints =
  () =>
  (state: RootState): app_protobufs_Waypoint[] =>
    Object.values(state.devices.device?.waypoints ?? []);

// Returns single waypoint object given ID
export const selectWaypointByID =
  (id: number) =>
  (state: RootState): app_protobufs_Waypoint | null => {
    for (const waypoint of selectAllWaypoints()(state)) {
      if (waypoint.id === id) return waypoint;
    }
    return null;
  };

// Get ID of the active waypoint
export const selectActiveWaypointID = () => (state: RootState) =>
  state.devices.activeWaypoint;

// Get actual Waypoint object
export const selectActiveWaypoint =
  () =>
  (state: RootState): app_protobufs_Waypoint | null => {
    const activeID = selectActiveWaypointID()(state);
    if (activeID === null) return null;
    return selectWaypointByID(activeID)(state);
  };

// What info pane are we showing
export const selectInfoPane = () => (state: RootState) =>
  state.devices.infoPane;

export const selectWaypointByLocation =
  (lat: number, long: number) =>
  (state: RootState): app_protobufs_Waypoint | null => {
    return (
      selectAllWaypoints()(state).find(
        (waypoint) => waypoint.latitudeI === lat && waypoint.longitudeI === long
      ) ?? null
    );
  };

export const selectPlaceholderWaypoint = () => (state: RootState) =>
  state.devices.placeholderWaypoint;

export const selectAutoConnectPort = () => (state: RootState) =>
  state.devices.autoConnectPort;
