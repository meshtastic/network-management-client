import type { RootState } from "@app/store";
import type { MeshDevice } from "@bindings/MeshDevice";
import type { MeshNode } from "@bindings/MeshNode";
import type { User } from "@bindings/protobufs/User";
import type { MeshChannel } from "@bindings/MeshChannel";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

export const selectAvailablePorts =
  () =>
  (state: RootState): string[] | null =>
    state.devices.availableSerialPorts;

export const selectActiveSerialPort =
  () =>
  (state: RootState): string | null =>
    state.devices.activeSerialPort;

export const selectDevice =
  () =>
  (state: RootState): MeshDevice | null =>
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
  (state: RootState): MeshNode[] =>
    Object.values(state.devices.device?.nodes ?? []);

export const selectNodeById =
  (id: number) =>
  (state: RootState): MeshNode | null => {
    for (const node of selectAllNodes()(state)) {
      if (node.data.num === id) return node;
    }

    return null;
  };

export const selectActiveNodeId = () => (state: RootState) =>
  state.devices.activeNode;

export const selectActiveNode =
  () =>
  (state: RootState): MeshNode | null => {
    const activeNodeId = selectActiveNodeId()(state);
    if (!activeNodeId) return null;
    return selectNodeById(activeNodeId)(state);
  };

export const selectAllUsersByNodeIds =
  () =>
  (state: RootState): Record<number, User | null> =>
    selectAllNodes()(state).reduce((accum, n) => {
      const user = n.data.user;
      return user ? { ...accum, [n.data.num]: user } : accum;
    }, [] as User[]);

export const selectUserByNodeId =
  (nodeId: number) =>
  (state: RootState): User | null =>
    selectNodeById(nodeId)(state)?.data.user ?? null;

export const selectDeviceChannels =
  () =>
  (state: RootState): MeshChannel[] =>
    Object.values(selectDevice()(state)?.channels ?? []);

// Returns list of all waypoints on connected node
export const selectAllWaypoints =
  () =>
  (state: RootState): Waypoint[] =>
    Object.values(state.devices.device?.waypoints ?? []);

// Returns single waypoint object given ID
export const selectWaypointByID =
  (id: number) =>
  (state: RootState): Waypoint | null => {
    for (const waypoint of selectAllWaypoints()(state)) {
      if (waypoint.id === id) return waypoint;
    }
    return null;
  };

// Get ID of the active waypoint
export const selectActiveWaypointID = () => (state: RootState) =>
  state.devices.activeWaypoint;

// Get actual Waypoint object that's active
export const selectActiveWaypoint =
  () =>
  (state: RootState): Waypoint | null => {
    const activeID = selectActiveWaypointID()(state);
    if (activeID) {
      return selectWaypointByID(activeID)(state);
    } else {
      return null;
    }
  };

// Are we currently in the waypoint edit state
export const selectIsWaypointEdit = () => (state: RootState) =>
  state.devices.waypointEdit;

export const selectAllowOnMapWaypointCreation = () => (state: RootState) =>
  state.devices.allowOnMapWaypointCreation;

export const selectShowAlgosAccordion = () => (state: RootState) =>
  state.devices.showAlgosAccordion;