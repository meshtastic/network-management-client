import React from "react"; // { useState , FormEventHandler },

import { deviceSliceActions } from "@features/device/deviceSlice";

import { useSelector, useDispatch } from "react-redux";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

import { requestNewWaypoint } from "@features/device/deviceActions";
import { Input } from "@material-tailwind/react";

import {
  XMarkIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import {
  selectActiveWaypoint,
  selectIsWaypointEdit,
} from "@app/features/device/deviceSelectors";
import moment from "moment";

import { writeValueToClipboard } from "@utils/clipboard";

// const [waypointTitle, setWaypointTitle] = useState(activeWaypoint?.name);
// const [waypointDescription, setWaypointDescription] = useState(
//   activeWaypoint?.description
// );

// Done
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

// Done
const useToggleEditWaypoint = () => {
  const dispatch = useDispatch();
  const isWaypointEdit = useSelector(selectIsWaypointEdit());
  return () => {
    dispatch(deviceSliceActions.setWaypointEdit(!isWaypointEdit));
  };
};


// Todo
// const useSendWaypoint = (waypoint: Waypoint) => {}

export { useDeleteWaypoint, useToggleEditWaypoint };
