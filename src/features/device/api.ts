import { useDispatch } from "react-redux";

import * as backendRadioApi from "@api/radio";
import * as backendMeshApi from "@api/mesh";
import * as backendConnectionApi from "@api/connection";

import type {
  app_device_NormalizedWaypoint,
  meshtastic_protobufs_User,
} from "@bindings/index";

import { connectionSliceActions } from "@features/connection/slice";
import { uiSliceActions } from "@features/ui/slice";

import { deviceSliceActions } from "./slice";

import { trackRequestOperation } from "@utils/api";
import { ConnectionType, type DeviceKey } from "@utils/connections";
import { type CommandError, throwError } from "@utils/errors";

export enum DeviceApiActions {
  GetAutoConnectPort = "device/getAutoConnectPort",
  SubscribeAll = "device/subscribeAll",
  GetAvailableSerialPorts = "device/getAvailableSerialPorts",
  InitializeApplication = "device/initializeApplication",
  ConnectToDevice = "device/connectToDevice",
  DisconnectFromDevice = "device/disconnectFromDevice",
  DisconnectFromAllDevices = "device/disconnectFromAllDevices",
  SendText = "device/sendText",
  UpdateUserConfig = "device/updateUserConfig",
  SendWaypoint = "device/sendWaypoint",
  DeleteWaypoint = "device/deleteWaypoint",
}

export const useDeviceApi = () => {
  const dispatch = useDispatch();

  const getAutoConnectPort = async () => {
    const TYPE = DeviceApiActions.GetAutoConnectPort;

    await trackRequestOperation(TYPE, dispatch, async () => {
      const portName = await backendConnectionApi.requestAutoConnectPort();

      dispatch(deviceSliceActions.setAutoConnectPort(portName));

      // Automatically connect to port
      if (portName) {
        await connectToDevice({
          params: {
            type: ConnectionType.SERIAL,
            portName,
            dtr: true,
            rts: false,
          },
          setPrimary: true,
        });
      }
    });
  };

  const getAvailableSerialPorts = async () => {
    const TYPE = DeviceApiActions.GetAvailableSerialPorts;

    await trackRequestOperation(TYPE, dispatch, async () => {
      const serialPorts = await backendConnectionApi.getAllSerialPorts();

      dispatch(deviceSliceActions.setAvailableSerialPorts(serialPorts));
    });
  };

  const connectToDevice = async (payload: {
    params:
      | {
          type: ConnectionType.BLUETOOTH;
          bluetoothName: string;
        }
      | {
          type: ConnectionType.SERIAL;
          portName: string;
          dtr: boolean;
          rts: boolean;
        }
      | { type: ConnectionType.TCP; socketAddress: string };
    setPrimary: boolean;
  }) => {
    const TYPE = DeviceApiActions.ConnectToDevice;

    const deviceKey: DeviceKey =
      payload.params.type === ConnectionType.SERIAL
        ? payload.params.portName
        : payload.params.type === ConnectionType.TCP
          ? payload.params.socketAddress
          : throwError("Neither portName nor socketAddress were set");

    await trackRequestOperation(
      TYPE,
      dispatch,
      async () => {
        dispatch(
          connectionSliceActions.setConnectionState({
            deviceKey,
            status: {
              status: "PENDING",
            },
          }),
        );

        if (payload.params.type === ConnectionType.BLUETOOTH) {
          await backendConnectionApi.connectToBluetooth(
            payload.params.bluetoothName,
          );
        }

        if (payload.params.type === ConnectionType.SERIAL) {
          await backendConnectionApi.connectToSerialPort(
            payload.params.portName,
            undefined,
            payload.params.dtr,
            payload.params.rts,
          );
        }

        if (payload.params.type === ConnectionType.TCP) {
          await backendConnectionApi.connectToTcpPort(
            payload.params.socketAddress,
          );
        }

        if (payload.setPrimary) {
          if (payload.params.type === ConnectionType.SERIAL) {
            dispatch(
              deviceSliceActions.setPrimaryDeviceConnectionKey(
                payload.params.portName,
              ),
            );
          }

          if (payload.params.type === ConnectionType.TCP) {
            dispatch(
              deviceSliceActions.setPrimaryDeviceConnectionKey(
                payload.params.socketAddress,
              ),
            );
          }
        }
      },
      (e) => {
        dispatch(
          connectionSliceActions.setConnectionState({
            deviceKey,
            status: {
              status: "FAILED",
              message: (e as CommandError).message,
            },
          }),
        );
      },
    );
  };

  const disconnectFromDevice = async (payload: DeviceKey) => {
    const TYPE = DeviceApiActions.DisconnectFromDevice;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await backendConnectionApi.dropDeviceConnection(payload);

      dispatch(deviceSliceActions.setPrimaryDeviceConnectionKey(null));
      dispatch(uiSliceActions.setActiveNode(null));
      dispatch(deviceSliceActions.setDevice(null));
    });
  };

  const disconnectFromAllDevices = async () => {
    const TYPE = DeviceApiActions.DisconnectFromAllDevices;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await backendConnectionApi.dropAllDeviceConnections();

      dispatch(deviceSliceActions.setPrimaryDeviceConnectionKey(null));
      dispatch(uiSliceActions.setActiveNode(null));
      dispatch(deviceSliceActions.setDevice(null));
    });
  };

  const sendText = async (payload: {
    deviceKey: string;
    text: string;
    channel: number;
  }) => {
    const TYPE = DeviceApiActions.SendText;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await backendMeshApi.sendText(
        payload.deviceKey,
        payload.channel,
        payload.text,
      );
    });
  };

  const updateUserConfig = async (payload: {
    deviceKey: string;
    user: meshtastic_protobufs_User;
  }) => {
    const TYPE = DeviceApiActions.UpdateUserConfig;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await backendRadioApi.updateDeviceUser(payload.deviceKey, payload.user);
    });
  };

  const sendWaypoint = async (payload: {
    deviceKey: string;
    waypoint: app_device_NormalizedWaypoint;
    channel: number;
  }) => {
    const TYPE = DeviceApiActions.SendWaypoint;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await backendMeshApi.sendWaypoint(
        payload.deviceKey,
        payload.channel,
        payload.waypoint,
      );
    });
  };

  const deleteWaypoint = async (payload: {
    deviceKey: string;
    waypointId: number;
  }) => {
    const TYPE = DeviceApiActions.DeleteWaypoint;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await backendMeshApi.deleteWaypoint(
        payload.deviceKey,
        payload.waypointId,
      );
    });
  };

  return {
    getAutoConnectPort,
    getAvailableSerialPorts,
    connectToDevice,
    disconnectFromDevice,
    disconnectFromAllDevices,
    sendText,
    updateUserConfig,
    sendWaypoint,
    deleteWaypoint,
  };
};
