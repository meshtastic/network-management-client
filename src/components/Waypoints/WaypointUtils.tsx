import React from "react"; // { useState , FormEventHandler },
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

import type { Waypoint } from "@bindings/protobufs/Waypoint";

import { requestNewWaypoint } from "@features/device/deviceActions";
import { deviceSliceActions } from "@features/device/deviceSlice";
import {
  selectActiveWaypoint,
  selectIsWaypointEdit,
} from "@app/features/device/deviceSelectors";

// This file contains utils for: Delete waypoint and Toggle editWaypoint

// Delete waypoint
const useDeleteWaypoint = () => {
  const dispatch = useDispatch();
  const activeWaypoint = useSelector(selectActiveWaypoint());

  return () => {
    console.log("Deleted waypoint");

    // Set expiry to time one second ago
    if (activeWaypoint) {
      const updatedWaypoint: Waypoint = {
        ...activeWaypoint,
        expire: Math.round(moment().valueOf() / 1000) - 1,
      };

      // Update waypoint and clear ActiveWaypoint
      dispatch(requestNewWaypoint({ waypoint: updatedWaypoint, channel: 0 }));
      dispatch(deviceSliceActions.setActiveWaypoint(null));

      // Error
    } else {
      console.log("Error: No active waypoint");
    }
  };
};

// Toggles state of editWaypoint
const useToggleEditWaypoint = () => {
  const dispatch = useDispatch();
  const isWaypointEdit = useSelector(selectIsWaypointEdit());
  return () => {
    dispatch(deviceSliceActions.setWaypointEdit(!isWaypointEdit));
  };
};

// TODO: const useSendWaypoint = (waypoint: Waypoint) => {}

export { useDeleteWaypoint, useToggleEditWaypoint };
