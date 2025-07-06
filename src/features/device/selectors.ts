import type { RootState } from "@app/store";

import type {
  app_device_MeshChannel,
  app_device_MeshDevice,
  app_device_MeshNode,
  app_device_NormalizedWaypoint,
  meshtastic_protobufs_User,
} from "@bindings/index";

export const selectAvailableBluetoothDevices =
  () =>
  (state: RootState): string[] | null =>
    state.devices.availableBluetoothDevices;

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
    id ? selectAllNodes()(state).find((n) => n.nodeNum === id) ?? null : null;

export const selectAllUsersByNodeIds =
  () =>
  (state: RootState): Record<number, meshtastic_protobufs_User | null> =>
    selectAllNodes()(state).reduce(
      (accum, n) => {
        const { user } = n;

        if (user) {
          accum[n.nodeNum] = user;
        }

        return accum;
      },
      [] as meshtastic_protobufs_User[],
    );

export const selectUserByNodeId =
  (nodeId: number) =>
  (state: RootState): meshtastic_protobufs_User | null =>
    selectNodeById(nodeId)(state)?.user ?? null;

export const selectDeviceChannels =
  () =>
  (state: RootState): app_device_MeshChannel[] =>
    Object.values(selectDevice()(state)?.channels ?? []);

// Returns list of all waypoints on connected node
export const selectAllWaypoints =
  () =>
  (state: RootState): app_device_NormalizedWaypoint[] =>
    Object.values(state.devices.device?.waypoints ?? []).filter(
      // Filter waypoints that were set to expire in the past
      (w) => !w.expire || w.expire * 1000 > Date.now(),
    );

// Returns single waypoint object given ID
export const selectWaypointById =
  (id: number) =>
  (state: RootState): app_device_NormalizedWaypoint | null => {
    for (const waypoint of selectAllWaypoints()(state)) {
      if (waypoint.id === id) return waypoint;
    }
    return null;
  };

export const selectWaypointByLocation =
  (lat: number, long: number) =>
  (state: RootState): app_device_NormalizedWaypoint | null => {
    return (
      selectAllWaypoints()(state).find(
        (waypoint) => waypoint.latitude === lat && waypoint.longitude === long,
      ) ?? null
    );
  };

export const selectAutoConnectPort = () => (state: RootState) =>
  state.devices.autoConnectPort;

export const selectAutoConnectBluetooth = () => (state: RootState) =>
  state.devices.autoConnectBluetooth;
