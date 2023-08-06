import { fromByteArray, toByteArray } from "base64-js";
import merge from "lodash.merge";
import cloneDeep from "lodash.clonedeep";
import type { DeepPartial } from "react-hook-form";

import type { app_device_MeshChannel } from "@bindings/index";
import type { ChannelConfigInput } from "@features/config/slice";

export const dateTimeLocalFormatString = "YYYY-MM-DDThh:mm";

export const getDefaultConfigInput = <C, E>(
  currentConfig: C | undefined,
  editedConfig: E | undefined
): Partial<E> | undefined => {
  return merge(cloneDeep(currentConfig), editedConfig);
};

export const getCurrentConfigFromMeshChannel = (
  channel: app_device_MeshChannel
): ChannelConfigInput => {
  return {
    role: channel.config.role,
    downlinkEnabled: channel.config.settings?.downlinkEnabled ?? false,
    name: channel.config.settings?.name ?? "",
    psk: fromByteArray(new Uint8Array(channel.config.settings?.psk ?? [])),
    uplinkEnabled: channel.config.settings?.uplinkEnabled ?? false,
  };
};

export const getMeshChannelFromCurrentConfig = (
  config: ChannelConfigInput
): DeepPartial<app_device_MeshChannel> => {
  return {
    config: {
      role: config.role,
      settings: {
        downlinkEnabled: config.downlinkEnabled,
        name: config.name,
        psk: Array.from(toByteArray(config.psk)),
        uplinkEnabled: config.uplinkEnabled,
      },
    },
  };
};
