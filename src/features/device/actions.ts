import { createAction } from "@reduxjs/toolkit";

import type {
  app_device_NormalizedWaypoint,
  meshtastic_protobufs_User,
} from "@bindings/index";

import type { ConnectionType, DeviceKey } from "@utils/connections";

export const requestAvailablePorts = createAction(
  "@device/request-available-ports",
);

export const requestInitializeApplication = createAction(
  "@device/request-initialize-application",
);

export const requestConnectToDevice = createAction<{
  params:
    | {
        type: ConnectionType.SERIAL;
        portName: string;
        dtr: boolean;
        rts: boolean;
      }
    | { type: ConnectionType.TCP; socketAddress: string };
  setPrimary: boolean;
}>("@device/request-connect");

export const requestDisconnectFromDevice = createAction<DeviceKey>(
  "@device/request-disconnect",
);

export const requestDisconnectFromAllDevices = createAction(
  "@device/request-disconnect-all",
);

export const requestSendMessage = createAction<{
  deviceKey: string;
  text: string;
  channel: number;
}>("@device/request-send-message");

export const requestUpdateUser = createAction<{
  deviceKey: string;
  user: meshtastic_protobufs_User;
}>("@device/update-device-user");

export const requestSendWaypoint = createAction<{
  deviceKey: string;
  waypoint: app_device_NormalizedWaypoint;
  channel: number;
}>("@device/send-waypoint");

export const requestDeleteWaypoint = createAction<{
  deviceKey: string;
  waypointId: number;
}>("@device/delete-waypoint");

export const requestAutoConnectPort = createAction(
  "@device/request-autoconnect-port",
);
