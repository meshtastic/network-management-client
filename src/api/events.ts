import { listen } from "@tauri-apps/api/event";
import { useDispatch } from "react-redux";

import { app_device_MeshDevice } from "@bindings/index";

import { connectionSliceActions } from "@features/connection/slice";
import { deviceSliceActions } from "@features/device/slice";
import { useDeviceApi } from "@features/device/api";

import { DeviceKey } from "@utils/connections";

export const useCreateDeviceUpdateChannel = () => {
  const dispatch = useDispatch();

  const createChannel = async () => {
    const unlisten = await listen<app_device_MeshDevice>(
      "device_update",
      (event) => {
        const updatedDevice = event.payload;
        dispatch(deviceSliceActions.setDevice(updatedDevice));
      },
    );

    return unlisten;
  };

  return createChannel;
};

export const useCreateDeviceDisconnectChannel = () => {
  const deviceApi = useDeviceApi();

  const createChannel = async () => {
    const unlisten = await listen<string>("device_disconnect", (event) => {
      const deviceKey = event.payload;
      deviceApi.disconnectFromDevice(deviceKey);
      window.location.reload();
    });

    return unlisten;
  };

  return createChannel;
};

export const useCreateConfigStatusChannel = () => {
  const dispatch = useDispatch();
  const deviceApi = useDeviceApi();

  const createChannel = async () => {
    const unlisten = await listen<{
      deviceKey: DeviceKey;
      successful: boolean;
      message: string | null;
    }>("configuration_status", (event) => {
      const {
        successful,
        deviceKey,
        message,
      }: {
        successful: boolean;
        deviceKey: DeviceKey;
        message: string | null;
      } = event.payload;

      if (!successful) {
        deviceApi.disconnectFromDevice(deviceKey);
      }

      dispatch(
        connectionSliceActions.setConnectionState({
          deviceKey: deviceKey,
          status: successful
            ? { status: "SUCCESSFUL" }
            : { status: "FAILED", message: message ?? "" },
        }),
      );
    });

    return unlisten;
  };

  return createChannel;
};

export const useCreateRebootChannel = () => {
  const createChannel = async () => {
    const unlisten = await listen<number>("reboot", (event) => {
      const rebootTimestampSec = event.payload;

      const reboot_time = new Date(rebootTimestampSec * 1000);
      console.warn("Rebooting at", reboot_time);
      window.location.reload();
    });

    return unlisten;
  };

  return createChannel;
};
