import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type {
  app_protobufs_config_BluetoothConfig,
  app_protobufs_config_DeviceConfig,
  app_protobufs_config_DisplayConfig,
  app_protobufs_config_LoRaConfig,
  app_protobufs_config_NetworkConfig,
  app_protobufs_config_PositionConfig,
  app_protobufs_config_PowerConfig,
  app_protobufs_User,
} from "@bindings/index";

export type BluetoothConfigInput = app_protobufs_config_BluetoothConfig;
export type DeviceConfigInput = app_protobufs_config_DeviceConfig;
export type DisplayConfigInput = app_protobufs_config_DisplayConfig;
export type LoRaConfigInput = app_protobufs_config_LoRaConfig;
export type NetworkConfigInput = app_protobufs_config_NetworkConfig;
export type PositionConfigInput = app_protobufs_config_PositionConfig;
export type PowerConfigInput = app_protobufs_config_PowerConfig;

export type UserConfigInput = Pick<
  app_protobufs_User,
  "shortName" | "longName" | "isLicensed"
>;

export interface IRadioConfigState {
  bluetooth: BluetoothConfigInput | null;
  device: DeviceConfigInput | null;
  display: DisplayConfigInput | null;
  lora: LoRaConfigInput | null;
  network: NetworkConfigInput | null;
  position: PositionConfigInput | null;
  power: PowerConfigInput | null;
  user: UserConfigInput | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IModuleConfigState {
  audio: null;
  cannedMessage: null;
  externalNotification: null;
  mqtt: null;
  rangeTest: null;
  remoteHardware: null;
  serial: null;
  storeForward: null;
  telemetry: null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IChannelConfigState { }

export interface IConfigState {
  radio: IRadioConfigState;
  module: IModuleConfigState;
  channel: IChannelConfigState;
}

export const initialConfigState: IConfigState = {
  radio: {
    bluetooth: null,
    device: null,
    display: null,
    lora: null,
    network: null,
    position: null,
    power: null,
    user: null,
  },
  module: {
    audio: null,
    cannedMessage: null,
    externalNotification: null,
    mqtt: null,
    rangeTest: null,
    remoteHardware: null,
    serial: null,
    storeForward: null,
    telemetry: null,
  },
  channel: {},
};

export const configSlice = createSlice({
  name: "config",
  initialState: initialConfigState,
  reducers: {
    updateRadioConfig: (
      state,
      action: PayloadAction<Partial<IConfigState["radio"]>>
    ) => {
      state.radio = {
        ...state.radio,
        ...action.payload,
      };
    },
  },
});

export const { actions: configSliceActions, reducer: configReducer } =
  configSlice;
