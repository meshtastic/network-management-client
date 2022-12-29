import { createAction } from "@reduxjs/toolkit";

export const requestCreateDeviceAction = createAction<number>(
  "@device/request-create-device"
);

export const requestSendMessage = createAction<{ text: string; channel: 0 }>(
  "@device/request-send-message"
);
