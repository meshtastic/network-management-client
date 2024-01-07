import type { RootState } from "@app/store";

import type {
  app_device_MeshChannel,
  meshtastic_protobufs_LocalConfig,
  meshtastic_protobufs_LocalModuleConfig,
} from "@bindings/index";

import type {
  ChannelConfigInput,
  IModuleConfigState,
  IRadioConfigState,
} from "@features/config/slice";

export const selectCurrentRadioConfig =
  () =>
  (state: RootState): meshtastic_protobufs_LocalConfig | null =>
    state.devices.device?.config ?? null;

export const selectEditedRadioConfig =
  () =>
  (state: RootState): IRadioConfigState =>
    state.config.radio;

export const selectCurrentModuleConfig =
  () =>
  (state: RootState): meshtastic_protobufs_LocalModuleConfig | null =>
    state.devices.device?.moduleConfig ?? null;

export const selectEditedModuleConfig =
  () =>
  (state: RootState): IModuleConfigState =>
    state.config.module;

export const selectCurrentChannelConfig =
  (channelNum: number) =>
  (state: RootState): app_device_MeshChannel | null =>
    state.devices.device?.channels?.[channelNum] ?? null;

export const selectEditedChannelConfig =
  (channelNum: number) =>
  (state: RootState): ChannelConfigInput | null =>
    state.config.channel[channelNum];

export const selectCurrentAllChannelConfig =
  () =>
  (state: RootState): Record<number, app_device_MeshChannel> | null =>
    state.devices.device?.channels ?? null;

export const selectEditedAllChannelConfig =
  () =>
  (state: RootState): Record<number, ChannelConfigInput | null> =>
    state.config.channel;

export const selectConfigInProgress =
  () =>
  (state: RootState): boolean | null =>
    state.devices.device?.configInProgress ?? null;
