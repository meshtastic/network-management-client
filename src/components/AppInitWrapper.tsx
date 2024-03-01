import { PropsWithChildren, useEffect, useState } from "react";
import { attachConsole } from "tauri-plugin-log-api";
import { info } from "tauri-plugin-log-api";

import * as backendGraphApi from "@api/graph";

import {
  useCreateConfigStatusChannel,
  useCreateDeviceDisconnectChannel,
  useCreateDeviceUpdateChannel,
  useCreateGraphUpdateChannel,
  useCreateRebootChannel,
} from "@api/events";
import { useAppConfigApi } from "@features/appConfig/api";
import { useAsyncUnlistenUseEffect } from "@utils/ui";

export const AppInitWrapper = ({ children }: PropsWithChildren) => {
  const appConfigApi = useAppConfigApi();

  const createDeviceUpdateChannel = useCreateDeviceUpdateChannel();
  const createDeviceDisconnectChannel = useCreateDeviceDisconnectChannel();
  const createConfigStatusChannel = useCreateConfigStatusChannel();
  const createRebootChannel = useCreateRebootChannel();
  const createGraphUpdateChannel = useCreateGraphUpdateChannel();

  const [hasLoaded, setLoaded] = useState(false);

  useEffect(() => {
    appConfigApi.initializeAppConfig();
    backendGraphApi.initializeTimeoutHandler();

    return () => {
      backendGraphApi.stopTimeoutHandler();
    };
  }, []);

  useAsyncUnlistenUseEffect(async () => {
    const detachConsole = await attachConsole();

    info("Console logger attached");

    return () => {
      detachConsole();
    };
  }, []);

  useAsyncUnlistenUseEffect(async () => {
    const unlistenDeviceUpdate = await createDeviceUpdateChannel();
    const unlistenDeviceDisconnect = await createDeviceDisconnectChannel();
    const unlistenConfigStatus = await createConfigStatusChannel();
    const unlistenReboot = await createRebootChannel();
    const unlistenGraphUpdate = await createGraphUpdateChannel();

    setLoaded(true);

    return () => {
      unlistenDeviceUpdate();
      unlistenDeviceDisconnect();
      unlistenConfigStatus();
      unlistenReboot();
      unlistenGraphUpdate();
    };
  }, []);

  return <div>{hasLoaded ? children : null}</div>;
};
