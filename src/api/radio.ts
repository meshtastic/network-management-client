import { invoke } from "@tauri-apps/api";

import {
  app_ipc_DeviceBulkConfig,
  meshtastic_protobufs_Config,
  meshtastic_protobufs_User,
} from "@bindings/index";
import { DeviceKey } from "@utils/connections";

export const updateDeviceConfig = async (
  deviceKey: DeviceKey,
  config: meshtastic_protobufs_Config,
) => {
  const response = (await invoke("update_device_config", {
    deviceKey: deviceKey,
    config: config,
  })) as undefined;

  return response;
};

export const updateDeviceUser = async (
  deviceKey: DeviceKey,
  user: meshtastic_protobufs_User,
) => {
  const response = (await invoke("update_device_user", {
    deviceKey: deviceKey,
    user: user,
  })) as undefined;

  return response;
};

export const startConfigurationTransaction = async (deviceKey: DeviceKey) => {
  const response = (await invoke("start_configuration_transaction", {
    deviceKey: deviceKey,
  })) as undefined;

  return response;
};

export const commitConfigurationTransaction = async (deviceKey: DeviceKey) => {
  const response = (await invoke("commit_configuration_transaction", {
    deviceKey: deviceKey,
  })) as undefined;

  return response;
};

export const updateDeviceConfigBulk = async (
  deviceKey: DeviceKey,
  config: app_ipc_DeviceBulkConfig,
) => {
  const response = (await invoke("update_device_config_bulk", {
    deviceKey: deviceKey,
    config: config,
  })) as undefined;

  return response;
};
