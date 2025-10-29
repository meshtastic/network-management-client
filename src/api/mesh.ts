import { invoke } from "@tauri-apps/api/core";
import type { app_device_NormalizedWaypoint } from "@bindings/index";
import type { DeviceKey } from "@utils/connections";

export const sendText = async (
  deviceKey: DeviceKey,
  deviceChannel: number,
  text: string,
) => {
  const response = (await invoke("send_text", {
    request: { deviceKey: deviceKey, channel: deviceChannel, text: text },
  })) as undefined;

  return response;
};

export const sendWaypoint = async (
  deviceKey: DeviceKey,
  deviceChannel: number,
  waypoint: app_device_NormalizedWaypoint,
) => {
  const response = (await invoke("send_waypoint", {
    request: {
      deviceKey: deviceKey,
      channel: deviceChannel,
      waypoint: waypoint,
    },
  })) as undefined;

  return response;
};

export const deleteWaypoint = async (
  deviceKey: DeviceKey,
  waypointId: number,
) => {
  const response = (await invoke("delete_waypoint", {
    request: { deviceKey: deviceKey, waypointId: waypointId },
  })) as undefined;

  return response;
};
