import React from "react";
import { Marker, MarkerProps } from "react-map-gl";

import WaypointIcon from "@components/Waypoints/WaypointIcon";

// This component returns a marker for each individual waypoint. It is called from MapView.tsx
export interface IMeshWaypointProps extends MarkerProps {
  latitude: number;
  longitude: number;
  isSelected: boolean;
  onClick?: () => void;
}

// All references to currWaypoint being null don't end up getting used because if it's null then we return <></>
const MeshWaypoint = ({
  latitude,
  longitude,
  isSelected,
  ...props
}: IMeshWaypointProps) => {
  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="center"
      {...props}
    >
      <div
        className={`${
          props.onClick
            ? "cursor-pointer"
            : props.draggable
            ? "cursor-move"
            : "cursor-default"
        }`}
      >
        <WaypointIcon isSelected={isSelected} />
      </div>
    </Marker>
  );
};

export default MeshWaypoint;
