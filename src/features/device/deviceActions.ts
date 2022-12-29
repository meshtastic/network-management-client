import { createAction } from "@reduxjs/toolkit";

export const requestConnectToDevice = createAction("@device/request-connect");

export const requestDisconnectFromDevice = createAction(
  "@device/request-disconnect"
);

export const requestSendMessage = createAction<{ text: string; channel: 0 }>(
  "@device/request-send-message"
);
