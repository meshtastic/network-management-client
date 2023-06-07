import { createAction } from "@reduxjs/toolkit";

import type {
  app_protobufs_User,
  app_protobufs_Waypoint,
} from "@bindings/index";

export const requestAvailablePorts = createAction(
  "@device/request-available-ports"
);

export const requestInitializeApplication = createAction("@device/request-initialize-application");

export const requestConnectToDevice = createAction<{
  portName?: string;
  socketAddress?: string;
  setPrimary: boolean;
}>("@device/request-connect");

export const requestDisconnectFromDevice = createAction<string>(
  "@device/request-disconnect"
);

export const requestDisconnectFromAllDevices = createAction(
  "@device/request-disconnect-all"
);

export const requestSendMessage = createAction<{
  portName: string;
  text: string;
  channel: number;
}>("@device/request-send-message");

export const requestUpdateUser = createAction<{
  portName: string;
  user: app_protobufs_User;
}>("@device/update-device-user");

export const requestNewWaypoint = createAction<{
  portName: string;
  waypoint: app_protobufs_Waypoint;
  channel: number;
}>("@device/send-waypoint");

export const requestAutoConnectPort = createAction(
  "@device/request-autoconnect-port"
);
