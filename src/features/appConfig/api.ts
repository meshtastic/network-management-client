import { useDispatch } from "react-redux";

import { defaultStore } from "@store/persistence";

import {
  PersistedStateKeys,
  setAndValidateValueInPersistedStore,
  getValueFromPersistedStore,
} from "@utils/persistence";
import {
  type IGeneralConfigState,
  type IMapConfigState,
  type TcpConnectionMeta,
  type RecentConnection,
  appConfigSliceActions,
} from "./slice";
import { setColorModeClass } from "@utils/ui";
import { trackRequestOperation } from "@utils/api";

export enum AppConfigApiActions {
  FetchLastTcpConnectionMeta = "appConfig/fetchLastTcpConnectionMeta",
  PersistLastTcpConnectionMeta = "appConfig/persistLastTcpConnectionMeta",
  FetchRecentConnections = "appConfig/fetchRecentConnections",
  PersistRecentConnections = "appConfig/persistRecentConnections",
  AddRecentConnection = "appConfig/addRecentConnection",
  PersistGeneralConfig = "appConfig/persistGeneralConfig",
  PersistMapConfig = "appConfig/persistMapConfig",
  InitializeAppConfig = "appConfig/initializeAppConfig",
}

export const useAppConfigApi = () => {
  const dispatch = useDispatch();

  // TODO can probably be integrated into general initialization
  const fetchLastTcpConnectionMeta = async () => {
    const TYPE = AppConfigApiActions.FetchLastTcpConnectionMeta;

    await trackRequestOperation(TYPE, dispatch, async () => {
      const persistedValue = await getValueFromPersistedStore(
        defaultStore,
        PersistedStateKeys.LastTcpConnection,
      );

      dispatch(
        appConfigSliceActions.setLastTcpConnection(persistedValue ?? null),
      );
    });
  };

  const persistLastTcpConnectionMeta = async (
    payload: TcpConnectionMeta | null,
  ) => {
    const TYPE = AppConfigApiActions.PersistLastTcpConnectionMeta;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await setAndValidateValueInPersistedStore(
        defaultStore,
        PersistedStateKeys.LastTcpConnection,
        payload ?? undefined,
        true,
        "Failed to persist last TCP connection",
      );
    });
  };

  const _updateGeneralConfig = (generalConfig: IGeneralConfigState) => {
    setColorModeClass(generalConfig.colorMode);
    dispatch(appConfigSliceActions.updateGeneralConfig(generalConfig));
  };

  const persistGeneralConfig = async (generalConfig: IGeneralConfigState) => {
    const TYPE = AppConfigApiActions.PersistGeneralConfig;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await setAndValidateValueInPersistedStore(
        defaultStore,
        PersistedStateKeys.GeneralConfig,
        generalConfig,
        true,
        "Failed to persist general application configuration",
      );

      _updateGeneralConfig(generalConfig);
    });
  };

  const _updateMapConfig = (mapConfig: IMapConfigState) => {
    dispatch(appConfigSliceActions.updateMapConfig(mapConfig));
  };

  const persistMapConfig = async (mapConfig: IMapConfigState) => {
    const TYPE = AppConfigApiActions.PersistMapConfig;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await setAndValidateValueInPersistedStore(
        defaultStore,
        PersistedStateKeys.MapConfig,
        mapConfig,
        true,
        "Failed to persist map configuration",
      );

      _updateMapConfig(mapConfig);
    });
  };

  const fetchRecentConnections = async () => {
    const TYPE = AppConfigApiActions.FetchRecentConnections;

    await trackRequestOperation(TYPE, dispatch, async () => {
      const persistedValue = await getValueFromPersistedStore(
        defaultStore,
        PersistedStateKeys.RecentConnections,
      );

      dispatch(
        appConfigSliceActions.setRecentConnections(persistedValue ?? []),
      );
    });
  };

  const persistRecentConnections = async (connections: RecentConnection[]) => {
    const TYPE = AppConfigApiActions.PersistRecentConnections;

    await trackRequestOperation(TYPE, dispatch, async () => {
      await setAndValidateValueInPersistedStore(
        defaultStore,
        PersistedStateKeys.RecentConnections,
        connections,
        true,
        "Failed to persist recent connections",
      );
    });
  };

  const addRecentConnection = async (connection: RecentConnection) => {
    const TYPE = AppConfigApiActions.AddRecentConnection;

    await trackRequestOperation(TYPE, dispatch, async () => {
      dispatch(appConfigSliceActions.addRecentConnection(connection));
    });
  };

  const initializeAppConfig = async () => {
    const TYPE = AppConfigApiActions.InitializeAppConfig;

    await trackRequestOperation(TYPE, dispatch, async () => {
      const persistedGeneralConfig = await getValueFromPersistedStore(
        defaultStore,
        PersistedStateKeys.GeneralConfig,
      );

      if (persistedGeneralConfig) {
        _updateGeneralConfig(persistedGeneralConfig);
      } else {
        // Update color mode to system default if not persisted
        setColorModeClass("system");
      }

      const persistedMapConfig = await getValueFromPersistedStore(
        defaultStore,
        PersistedStateKeys.MapConfig,
      );

      if (persistedMapConfig) {
        _updateMapConfig(persistedMapConfig);
      }

      await fetchRecentConnections();
    });
  };

  return {
    fetchLastTcpConnectionMeta,
    persistLastTcpConnectionMeta,
    fetchRecentConnections,
    persistRecentConnections,
    addRecentConnection,
    persistGeneralConfig,
    persistMapConfig,
    initializeAppConfig,
  };
};
