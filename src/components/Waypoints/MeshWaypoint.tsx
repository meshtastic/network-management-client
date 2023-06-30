import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Marker } from "react-map-gl";

import type { app_protobufs_Waypoint } from "@bindings/index";

import WaypointIcon from "@components/Waypoints/WaypointIcon";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectActiveWaypointID } from "@features/device/deviceSelectors";

// This component returns a marker for each individual waypoint. It is called from MapView.tsx
interface IMeshWaypointProps {
  currWaypoint: app_protobufs_Waypoint | null;
}

// All references to currWaypoint being null don't end up getting used because if it's null then we return <></>
const MeshWaypoint = ({ currWaypoint }: IMeshWaypointProps) => {
  const dispatch = useDispatch();
  const activeWaypointID = useSelector(selectActiveWaypointID());
  const isSelected = currWaypoint?.id === activeWaypointID;
  const expired = currWaypoint
    ? currWaypoint.expire < Date.now() / 1000
    : false; // Boolean

  // Set current waypoint ID as active if it's not already;
  // Otherwise turn off active if it is already active.
  const handleClick = () => {
    // Do nothing if you click on a placeholder waypoint
    if (currWaypoint?.id) {
      dispatch(
        deviceSliceActions.setActiveWaypoint(
          !isSelected && currWaypoint ? currWaypoint.id : null
        )
      );
    }
  };

  if (!currWaypoint) return null;

  return (
    <div className="">
      <Marker
        latitude={currWaypoint.latitudeI / 1e7}
        longitude={currWaypoint.longitudeI / 1e7}
        anchor="center"
        onClick={handleClick}
      >
        <WaypointIcon isSelected={isSelected} expired={expired} />
      </Marker>
    </div>
  );
};

export default MeshWaypoint;
