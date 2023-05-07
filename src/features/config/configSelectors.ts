import type { RootState } from "@app/store";

import type {
  app_protobufs_LocalConfig,
  app_protobufs_LocalModuleConfig,
} from "@bindings/index";

import type {
  IRadioConfigState,
  IModuleConfigState
} from "@features/config/configSlice";

export const selectCurrentRadioConfig =
  () =>
    (state: RootState): app_protobufs_LocalConfig | null =>
      state.devices.device?.config ?? null;

export const selectCurrentModuleConfig =
  () =>
    (state: RootState): app_protobufs_LocalModuleConfig | null =>
      state.devices.device?.moduleConfig ?? null;

export const selectEditedRadioConfig =
  () =>
    (state: RootState): IRadioConfigState =>
      state.config.radio;

export const selectEditedModuleConfig =
  () =>
    (state: RootState): IModuleConfigState =>
      state.config.module;

export const selectConfigInProgress =
  () =>
    (state: RootState): boolean | null =>
      state.devices.device?.configInProgress ?? null;
