import type { RecentConnection } from "@features/appConfig/slice";
import type { app_device_MeshDevice } from "@bindings/index";

export type DeviceKey = string;

export enum ConnectionType {
  SERIAL = "SERIAL",
  TCP = "TCP",
}

export function createRecentConnectionFromDevice(
  address: string,
  device?: app_device_MeshDevice | null,
): RecentConnection {
  const id = `TCP:${address}`;

  const connectedNodeId = device?.myNodeInfo.myNodeNum;
  const connectedNode = connectedNodeId ? device?.nodes[connectedNodeId] : null;
  const user = connectedNode?.user;

  const deviceName = user?.longName || user?.shortName || "Unknown Device";

  return {
    id,
    address,
    deviceName,
    shortName: user?.shortName,
    longName: user?.longName,
    lastConnected: Date.now(),
    firstConnected: Date.now(),
  };
}

export function updateRecentConnectionWithDevice(
  connection: RecentConnection,
  device?: app_device_MeshDevice | null,
): RecentConnection {
  // Get device name from connected device
  const connectedNodeId = device?.myNodeInfo.myNodeNum;
  const connectedNode = connectedNodeId ? device?.nodes[connectedNodeId] : null;
  const user = connectedNode?.user;

  const deviceName =
    user?.longName ||
    user?.shortName ||
    connection.deviceName ||
    "Unknown Device";

  return {
    ...connection,
    deviceName,
    shortName: user?.shortName || connection.shortName,
    longName: user?.longName || connection.longName,
    lastConnected: Date.now(),
  };
}
