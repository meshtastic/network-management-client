import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import type { Waypoint } from "@bindings/protobufs/Waypoint";

import {
  selectActiveWaypoint,
  selectInfoPane,
  selectPrimarySerialPort,
} from "@features/device/deviceSelectors";
import { requestNewWaypoint } from "@features/device/deviceActions";
import { deviceSliceActions } from "@features/device/deviceSlice";

/**
 * This hook is intended for use in components that need to rerender
 * within a specific repeated time interval.
 * @param interval How often the component should reload (ms)
 * @returns The last time this hook forced a component reload
 */
const useComponentReload = (interval: number) => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const intervalHandle = setInterval(() => setTime(Date.now()), interval);
    return () => clearInterval(intervalHandle);
  }, []);

  return time;
};

// Waypoint Hook
const useDeleteWaypoint = () => {
  const dispatch = useDispatch();
  const activeWaypoint = useSelector(selectActiveWaypoint());
  const primaryPortName = useSelector(selectPrimarySerialPort());

  return () => {
    // Set expiry to time one second ago
    if (!activeWaypoint) {
      console.warn("Error: No active waypoint");
      return;
    }

    if (!primaryPortName) {
      console.warn("No active port, not deleting waypoint");
      return;
    }

    const updatedWaypoint: Waypoint = {
      ...activeWaypoint,
      expire: Math.round(moment().valueOf() / 1000) - 1,
    };

    // Update waypoint and clear ActiveWaypoint
    dispatch(
      requestNewWaypoint({
        portName: primaryPortName,
        waypoint: updatedWaypoint,
        channel: 0,
      }),
    );

    dispatch(deviceSliceActions.setActiveWaypoint(null));
  };
};

// Toggles state of editWaypoint
const useToggleEditWaypoint = () => {
  const dispatch = useDispatch();
  const isWaypointEdit = useSelector(selectInfoPane()) === "waypointEdit";

  return () => {
    dispatch(
      deviceSliceActions.setInfoPane(
        isWaypointEdit ? "waypoint" : "waypointEdit",
      ),
    );
  };
};

export { useComponentReload, useDeleteWaypoint, useToggleEditWaypoint };
