import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import WaypointIcon from "@app/components/Waypoints/WaypointIcon";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

import { Marker } from "react-map-gl";

import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectActiveWaypointID } from "@features/device/deviceSelectors";
import moment from "moment";

interface IWaypoints {
  currWaypoint: Waypoint;
}

const Waypoints = ({ currWaypoint }: IWaypoints) => {
  const dispatch = useDispatch();
  const activeWaypointID = useSelector(selectActiveWaypointID());
  const expired = currWaypoint.expire < moment().valueOf() / 1000;

  const handleClick = () => {
    console.log();
    dispatch(deviceSliceActions.setActiveWaypoint(currWaypoint.id));
  };

  return (
    <div className="">
      <Marker
        latitude={currWaypoint.latitudeI / 1e7}
        longitude={currWaypoint.longitudeI / 1e7}
        anchor="center"
        onClick={handleClick}
      >
        <WaypointIcon
          isSelected={currWaypoint.id === activeWaypointID}
          expired={expired}
        ></WaypointIcon>
      </Marker>
    </div>
  );
};

export default Waypoints;
