import { invoke } from "@tauri-apps/api/core";
import { app_ipc_DeviceBulkConfig } from "@bindings/index";
import { DeviceKey } from "@utils/connections";

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

export const requestAutoConnectPort = async () => {
  const response = (await invoke("request_autoconnect_port")) as string;

  return response;
};

export const getAllBluetooth = async () => {
  const response = (await invoke("get_all_bluetooth")) as string[];

  return response;
};

export const getAllSerialPorts = async () => {
  const response = (await invoke("get_all_serial_ports")) as string[];

  return response;
};

export const connectToSerialPort = async (
  portName: string,
  baudRate?: number,
  dtr?: boolean,
  rts?: boolean,
) => {
  const response = (await invoke("connect_to_serial_port", {
    portName,
    baudRate,
    dtr,
    rts,
  })) as undefined;

  return response;
};

export const connectToTcpPort = async (socketAddress: string) => {
  const response = (await invoke("connect_to_tcp_port", {
    address: socketAddress,
  })) as undefined;

  return response;
};

export const dropDeviceConnection = async (deviceKey: DeviceKey) => {
  const response = (await invoke("drop_device_connection", {
    deviceKey,
  })) as undefined;

  return response;
};

export const dropAllDeviceConnections = async () => {
  const response = (await invoke("drop_all_device_connections")) as undefined;

  return response;
};

export const connectToBluetooth = async (bluetoothName: string) => {
  const response = (await invoke("connect_to_bluetooth", {
    bluetoothName,
  })) as undefined;

  return response;
};
