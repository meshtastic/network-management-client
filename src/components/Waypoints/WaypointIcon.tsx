import React from "react";

import SelectedWaypoint from "@app/assets/waypoints/waypoint_selected.svg";
import DefaultWaypoint from "@app/assets/waypoints/waypoint_default.svg";
import type { app_device_NormalizedWaypoint } from "@bindings/index";

// File contains the waypoint icon and interface for two booleans that control its appearance
// Called in Waypoints.tsx, once for each node detected

export interface IWaypointProps {
  waypoint: app_device_NormalizedWaypoint;
  isSelected: boolean;
}

const WaypointIcon = ({ waypoint, isSelected }: IWaypointProps) => {
  return (
    <div className="relative">
      <img
        className={"drop-shadow-lg w-9 h-9"}
        src={isSelected ? SelectedWaypoint : DefaultWaypoint}
      />
      {!!waypoint.icon && (
        <p className="absolute top-0 left-1/2 -translate-x-1/2 text-xl text-center select-none">{`${String.fromCodePoint(
          waypoint.icon
        )}`}</p>
      )}
    </div>
  );
};
export default WaypointIcon;
