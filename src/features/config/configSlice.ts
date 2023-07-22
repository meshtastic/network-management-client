import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import merge from "lodash.merge";
import cloneDeep from "lodash.clonedeep";
import type { DeepPartial } from "react-hook-form";

import type {
  app_protobufs_config_BluetoothConfig,
  app_protobufs_config_DeviceConfig,
  app_protobufs_config_DisplayConfig,
  app_protobufs_config_LoRaConfig,
  app_protobufs_config_NetworkConfig,
  app_protobufs_config_PositionConfig,
  app_protobufs_config_PowerConfig,
  app_protobufs_module_config_AudioConfig,
  app_protobufs_module_config_CannedMessageConfig,
  app_protobufs_module_config_ExternalNotificationConfig,
  app_protobufs_module_config_MqttConfig,
  app_protobufs_module_config_RangeTestConfig,
  app_protobufs_module_config_RemoteHardwareConfig,
  app_protobufs_module_config_SerialConfig,
  app_protobufs_module_config_StoreForwardConfig,
  app_protobufs_module_config_TelemetryConfig,
  app_protobufs_Channel,
  app_protobufs_ChannelSettings,
} from "@bindings/index";

export type BluetoothConfigInput = app_protobufs_config_BluetoothConfig;
export type DeviceConfigInput = app_protobufs_config_DeviceConfig;
export type DisplayConfigInput = app_protobufs_config_DisplayConfig;
export type LoRaConfigInput = app_protobufs_config_LoRaConfig;
export type NetworkConfigInput = app_protobufs_config_NetworkConfig;
export type PositionConfigInput = app_protobufs_config_PositionConfig;
export type PowerConfigInput = app_protobufs_config_PowerConfig;

export type AudioModuleConfigInput = app_protobufs_module_config_AudioConfig;
export type CannedMessageModuleConfigInput =
  app_protobufs_module_config_CannedMessageConfig;
export type ExternalNotificationModuleConfigInput =
  app_protobufs_module_config_ExternalNotificationConfig;
export type MQTTModuleConfigInput = app_protobufs_module_config_MqttConfig;
export type RangeTestModuleConfigInput =
  app_protobufs_module_config_RangeTestConfig;
export type RemoteHardwareModuleConfigInput =
  app_protobufs_module_config_RemoteHardwareConfig;
export type SerialModuleConfigInput = app_protobufs_module_config_SerialConfig;
export type StoreForwardModuleConfigInput =
  app_protobufs_module_config_StoreForwardConfig;
export type TelemetryModuleConfigInput =
  app_protobufs_module_config_TelemetryConfig;

export type ChannelConfigInput = Omit<
  app_protobufs_ChannelSettings,
  "id" | "channelNum" | "psk"
> & { psk: string } & Pick<app_protobufs_Channel, "role">;

export interface IRadioConfigState {
  bluetooth: BluetoothConfigInput | null;
  device: DeviceConfigInput | null;
  display: DisplayConfigInput | null;
  lora: LoRaConfigInput | null;
  network: NetworkConfigInput | null;
  position: PositionConfigInput | null;
  power: PowerConfigInput | null;
}

export interface IModuleConfigState {
  // ! https://github.com/ajmcquilkin/meshtastic-network-management-client/issues/382
  // audio: AudioModuleConfigInput | null;
  cannedMessage: CannedMessageModuleConfigInput | null;
  externalNotification: ExternalNotificationModuleConfigInput | null;
  mqtt: MQTTModuleConfigInput | null;
  rangeTest: RangeTestModuleConfigInput | null;
  remoteHardware: RemoteHardwareModuleConfigInput | null;
  serial: SerialModuleConfigInput | null;
  storeForward: StoreForwardModuleConfigInput | null;
  telemetry: TelemetryModuleConfigInput | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IChannelConfigState {
  [key: number]: ChannelConfigInput | null;
}

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
    // user: null,
  },
  module: {
    // audio: null,
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
      action: PayloadAction<DeepPartial<IRadioConfigState>>
    ) => {
      state.radio = merge(cloneDeep(state.radio), action.payload);
    },

    clearRadioConfig: (state) => {
      state.radio = initialConfigState.radio;
    },

    updateModuleConfig: (
      state,
      action: PayloadAction<DeepPartial<IModuleConfigState>>
    ) => {
      state.module = merge(cloneDeep(state.module), action.payload);
    },

    clearModuleConfig: (state) => {
      state.module = initialConfigState.module;
    },

    updateChannelConfig: (
      state,
      action: PayloadAction<
        { channelNum: number; config: DeepPartial<ChannelConfigInput> | null }[]
      >
    ) => {
      const updatedPartialConfig: Record<
        number,
        DeepPartial<ChannelConfigInput> | null
      > = {};

      for (const entry of action.payload) {
        const { channelNum, config } = entry;

        // We know this parseInt won't fail bc `channelNum` is typed as a number
        // This is a limitation of Object.entries
        updatedPartialConfig[channelNum] = config;
      }

      state.channel = merge(cloneDeep(state.channel), updatedPartialConfig);
    },

    clearChannelConfig: (state) => {
      state.channel = initialConfigState.channel;
    },
  },
});

export const { actions: configSliceActions, reducer: configReducer } =
  configSlice;
