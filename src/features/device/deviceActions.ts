import { createAction } from "@reduxjs/toolkit";

export const requestCreateDeviceAction = createAction<number>(
  "@device/request-create-device"
);
