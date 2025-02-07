import { useDispatch, useSelector } from "react-redux";
import merge from "lodash.merge";
import cloneDeep from "lodash.clonedeep";
import mergeWith from "lodash.mergewith";

import * as backendRadioApi from "@api/radio";

import { type IConfigState, configSliceActions } from "./slice";
import {
  selectCurrentAllChannelConfig,
  selectCurrentModuleConfig,
  selectCurrentRadioConfig,
  selectEditedAllChannelConfig,
  selectEditedModuleConfig,
  selectEditedRadioConfig,
} from "./selectors";

import type {
  app_device_MeshChannel,
  app_ipc_DeviceBulkConfig,
} from "@bindings/index";
import { selectPrimaryDeviceKey } from "@features/device/selectors";

import { getMeshChannelFromCurrentConfig } from "@utils/form";
import { trackRequestOperation } from "@utils/api";

export enum ConfigApiActions {
  CommitConfig = "config/commitConfig",
}

export const useConfigApi = () => {
  const dispatch = useDispatch();

  const commitConfig = async (config: (keyof IConfigState)[]) => {
    const type = ConfigApiActions.CommitConfig;

    await trackRequestOperation(type, dispatch, async () => {
      const fieldFlags = config;

      const includeRadioConfig = fieldFlags.includes("radio");
      const includeModuleConfig = fieldFlags.includes("module");
      const includeChannelConfig = fieldFlags.includes("channel");

      const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());

      if (!primaryDeviceKey) {
        throw new Error("No active connection");
      }

      // Get current and edited config

      const currentRadioConfig = useSelector(selectCurrentRadioConfig());
      const editedRadioConfig = useSelector(selectEditedRadioConfig());
      const currentModuleConfig = useSelector(selectCurrentModuleConfig());
      const editedModuleConfig = useSelector(selectEditedModuleConfig());
      const currentChannelConfig = useSelector(selectCurrentAllChannelConfig());
      const editedChannelConfig = useSelector(selectEditedAllChannelConfig());

      if (!(currentRadioConfig && currentModuleConfig)) {
        throw new Error("Current radio or module config not defined");
      }

      const configPayload: app_ipc_DeviceBulkConfig = {
        radio: null,
        module: null,
        channels: null,
      };

      // Update config payload based on flags

      if (includeRadioConfig) {
        configPayload.radio = merge(
          cloneDeep(currentRadioConfig), // Redux object
          editedRadioConfig,
        );
      }

      if (includeModuleConfig) {
        configPayload.module = merge(
          cloneDeep(currentModuleConfig), // Redux object
          editedModuleConfig,
        );
      }

      if (includeChannelConfig) {
        if (!currentChannelConfig) {
          throw new Error("Current channel config not defined");
        }

        const mergedConfig: Record<number, app_device_MeshChannel> = {};

        for (const [idx, config] of Object.entries(editedChannelConfig)) {
          if (!config) continue;
          const channelNum = Number.parseInt(idx);
          const meshChannel = getMeshChannelFromCurrentConfig(config);

          mergedConfig[channelNum] = mergeWith(
            cloneDeep(currentChannelConfig[channelNum]),
            meshChannel,
            // * Need to override array values instead of merging
            (objVal, srcVal) => {
              if (Array.isArray(objVal)) return srcVal;
            },
          );
        }

        configPayload.channels = Object.values(mergedConfig).map(
          (mc) => mc.config,
        );
      }

      // Dispatch update to backend

      backendRadioApi.updateDeviceConfigBulk(primaryDeviceKey, configPayload);

      // Clear temporary config fields

      if (includeRadioConfig) {
        dispatch(configSliceActions.clearRadioConfig());
      }

      if (includeModuleConfig) {
        dispatch(configSliceActions.clearModuleConfig());
      }

      if (includeChannelConfig) {
        dispatch(configSliceActions.clearChannelConfig());
      }
    });
  };

  return {
    commitConfig,
  };
};
