import { invoke } from "@tauri-apps/api/core";
import type { app_ipc_DeviceBulkConfig } from "@bindings/index";
import type { DeviceKey } from "@utils/connections";

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
  const response = (await invoke("request_autoconnect_port", {
    request: {},
  })) as { port: string };

  return response.port;
};

export const getAllBluetooth = async () => {
  const response = (await invoke("get_all_bluetooth", {
    request: {},
  })) as { candidates: string[] };

  return response.candidates;
};

export const getAllSerialPorts = async () => {
  const response = (await invoke("get_all_serial_ports", {
    request: {},
  })) as { ports: string[] };

  return response.ports;
};

export const connectToSerialPort = async (
  portName: string,
  baudRate?: number,
  dtr?: boolean,
  rts?: boolean,
) => {
  const response = (await invoke("connect_to_serial_port", {
    request: {
      portName,
      baudRate,
      dtr,
      rts,
    },
  })) as undefined;

  return response;
};

export const connectToTcpPort = async (socketAddress: string) => {
  const response = (await invoke("connect_to_tcp_port", {
    request: { address: socketAddress },
  })) as undefined;

  return response;
};

export const dropDeviceConnection = async (deviceKey: DeviceKey) => {
  const response = (await invoke("drop_device_connection", {
    request: { deviceKey },
  })) as undefined;

  return response;
};

export const dropAllDeviceConnections = async () => {
  const response = (await invoke("drop_all_device_connections", {
    request: {},
  })) as undefined;

  return response;
};

export const connectToBluetooth = async (bluetoothName: string) => {
  const response = (await invoke("connect_to_bluetooth", {
    request: { bluetoothName },
  })) as undefined;

  return response;
};
