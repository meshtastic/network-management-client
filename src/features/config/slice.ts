import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import merge from "lodash.merge";
import cloneDeep from "lodash.clonedeep";
import type { DeepPartial } from "react-hook-form";

import type {
  meshtastic_protobufs_config_BluetoothConfig,
  meshtastic_protobufs_config_DeviceConfig,
  meshtastic_protobufs_config_DisplayConfig,
  meshtastic_protobufs_config_LoRaConfig,
  meshtastic_protobufs_config_NetworkConfig,
  meshtastic_protobufs_config_PositionConfig,
  meshtastic_protobufs_config_PowerConfig,
  meshtastic_protobufs_module_config_AudioConfig,
  meshtastic_protobufs_module_config_CannedMessageConfig,
  meshtastic_protobufs_module_config_ExternalNotificationConfig,
  meshtastic_protobufs_module_config_MqttConfig,
  meshtastic_protobufs_module_config_RangeTestConfig,
  meshtastic_protobufs_module_config_RemoteHardwareConfig,
  meshtastic_protobufs_module_config_SerialConfig,
  meshtastic_protobufs_module_config_StoreForwardConfig,
  meshtastic_protobufs_module_config_TelemetryConfig,
  meshtastic_protobufs_Channel,
  meshtastic_protobufs_ChannelSettings,
} from "@bindings/index";

export type BluetoothConfigInput = meshtastic_protobufs_config_BluetoothConfig;
export type DeviceConfigInput = meshtastic_protobufs_config_DeviceConfig;
export type DisplayConfigInput = meshtastic_protobufs_config_DisplayConfig;
export type LoRaConfigInput = meshtastic_protobufs_config_LoRaConfig;
export type NetworkConfigInput = meshtastic_protobufs_config_NetworkConfig;
export type PositionConfigInput = meshtastic_protobufs_config_PositionConfig;
export type PowerConfigInput = meshtastic_protobufs_config_PowerConfig;

export type AudioModuleConfigInput =
  meshtastic_protobufs_module_config_AudioConfig;
export type CannedMessageModuleConfigInput =
  meshtastic_protobufs_module_config_CannedMessageConfig;
export type ExternalNotificationModuleConfigInput =
  meshtastic_protobufs_module_config_ExternalNotificationConfig;
export type MQTTModuleConfigInput =
  meshtastic_protobufs_module_config_MqttConfig;
export type RangeTestModuleConfigInput =
  meshtastic_protobufs_module_config_RangeTestConfig;
export type RemoteHardwareModuleConfigInput =
  meshtastic_protobufs_module_config_RemoteHardwareConfig;
export type SerialModuleConfigInput =
  meshtastic_protobufs_module_config_SerialConfig;
export type StoreForwardModuleConfigInput =
  meshtastic_protobufs_module_config_StoreForwardConfig;
export type TelemetryModuleConfigInput =
  meshtastic_protobufs_module_config_TelemetryConfig;

export type ChannelConfigInput = Omit<
  meshtastic_protobufs_ChannelSettings,
  "id" | "channelNum" | "psk"
> & { psk: string } & Pick<meshtastic_protobufs_Channel, "role">;

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
      action: PayloadAction<DeepPartial<IRadioConfigState>>,
    ) => {
      state.radio = merge(cloneDeep(state.radio), action.payload);
    },

    clearRadioConfig: (state) => {
      state.radio = initialConfigState.radio;
    },

    updateModuleConfig: (
      state,
      action: PayloadAction<DeepPartial<IModuleConfigState>>,
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
      >,
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
