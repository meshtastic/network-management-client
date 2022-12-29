import { createAction } from "@reduxjs/toolkit";

export const requestAvailablePorts = createAction(
  "@device/request-available-ports"
);

export const requestConnectToDevice = createAction<string>(
  "@device/request-connect"
);

export const requestDisconnectFromDevice = createAction(
  "@device/request-disconnect"
);

export const requestSendMessage = createAction<{ text: string; channel: 0 }>(
  "@device/request-send-message"
);
