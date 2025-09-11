import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { useAppConfigApi } from "@features/appConfig/api";
import {
  selectDevice,
  selectPrimaryDeviceKey,
  selectPrimaryConnectionType,
} from "@features/device/selectors";
import { selectRecentConnections } from "@features/appConfig/selectors";
import { appConfigSliceActions } from "@features/appConfig/slice";

import {
  createRecentConnectionFromDevice,
  updateRecentConnectionWithDevice,
} from "@utils/connections";

/**
 * Hook to track successful device connections and add them to recent connections
 */
export const useRecentConnectionTracker = () => {
  const dispatch = useDispatch();
  const appConfigApi = useAppConfigApi();

  const device = useSelector(selectDevice());
  const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());
  const connectionType = useSelector(selectPrimaryConnectionType());
  const recentConnections = useSelector(selectRecentConnections());

  // Track whether we've processed this specific device state to prevent infinite loops
  const lastProcessedDeviceRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track when we have both device and primary connection
    if (!device || !primaryDeviceKey || !connectionType) {
      lastProcessedDeviceRef.current = null;
      return;
    }

    // Only track TCP connections
    if (connectionType !== "TCP") {
      return;
    }

    const connectedNodeId = device.myNodeInfo?.myNodeNum;
    const connectedUser = connectedNodeId
      ? device.nodes?.[connectedNodeId]?.user
      : null;

    // Skip if we don't have basic device info yet
    if (!device.myNodeInfo || !connectedNodeId) {
      return;
    }

    try {
      // Create a unique key based on device data that matters for recent connections
      const deviceKey = JSON.stringify({
        primaryDeviceKey,
        myNodeNum: connectedNodeId,
        connectedUser,
      });

      // Prevent processing the exact same device state multiple times
      if (lastProcessedDeviceRef.current === deviceKey) {
        return;
      }

      const address = primaryDeviceKey;
      const connectionId = `TCP:${address}`;
      const existingConnection = recentConnections.find(
        (conn) => conn.id === connectionId,
      );

      if (existingConnection) {
        // Update metadata of existing recent connections
        const updatedConnection = updateRecentConnectionWithDevice(
          existingConnection,
          device,
        );

        dispatch(appConfigSliceActions.addRecentConnection(updatedConnection));

        const currentConnections = recentConnections.filter(
          (conn) => conn.id !== connectionId,
        );
        appConfigApi.persistRecentConnections([
          updatedConnection,
          ...currentConnections,
        ]);
      } else {
        // Add to recent connections
        const newConnection = createRecentConnectionFromDevice(address, device);
        dispatch(appConfigSliceActions.addRecentConnection(newConnection));

        const updatedConnections = [newConnection, ...recentConnections].slice(
          0,
          10,
        );
        appConfigApi.persistRecentConnections(updatedConnections);
      }

      lastProcessedDeviceRef.current = deviceKey;
    } catch (error) {
      console.warn("Failed to track recent connection:", error);
      lastProcessedDeviceRef.current = null;
    }
  }, [
    device,
    primaryDeviceKey,
    connectionType,
    dispatch,
    appConfigApi,
    recentConnections,
  ]);
};
