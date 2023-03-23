import { createAction } from "@reduxjs/toolkit";
import type { User } from "@bindings/protobufs/User";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

export const requestDeviceConnectionStatus = createAction(
  "@device/device-connection-status",
);

export const requestAvailablePorts = createAction(
  "@device/request-available-ports",
);

export const requestConnectToDevice = createAction<string>(
  "@device/request-connect",
);

export const requestDisconnectFromDevice = createAction(
  "@device/request-disconnect",
);

export const requestSendMessage = createAction<{
  text: string;
  channel: number;
}>("@device/request-send-message");

export const requestUpdateUser = createAction<{ user: User }>(
  "@device/update-device-user",
);

export const requestNewWaypoint = createAction<{
  waypoint: Waypoint;
  channel: number;
}>("@device/send-waypoint");
