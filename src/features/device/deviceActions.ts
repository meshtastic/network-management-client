import { createAction } from "@reduxjs/toolkit";
import type { User } from "@bindings/protobufs/User";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

export const requestAvailablePorts = createAction(
  "@device/request-available-ports",
);

export const requestConnectToDevice = createAction<
  { portName: string; setPrimary: boolean }
>(
  "@device/request-connect",
);

export const requestDisconnectFromDevice = createAction<string>(
  "@device/request-disconnect",
);

export const requestDisconnectFromAllDevices = createAction(
  "@device/request-disconnect-all",
);

export const requestSendMessage = createAction<{
  portName: string;
  text: string;
  channel: number;
}>("@device/request-send-message");

export const requestUpdateUser = createAction<{ portName: string; user: User }>(
  "@device/update-device-user",
);

export const requestNewWaypoint = createAction<{
  portName: string;
  waypoint: Waypoint;
  channel: number;
}>("@device/send-waypoint");

export const requestAutoConnectPort = createAction(
  "@device/request-autoconnect-port",
);
