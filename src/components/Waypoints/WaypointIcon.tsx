import React from "react";

import SelectedWaypoint from "@app/assets/waypoints/waypoint_selected.svg";
import DefaultWaypoint from "@app/assets/waypoints/waypoint_default.svg";

// File contains the waypoint icon and interface for two booleans that control its appearance
// Called in Waypoints.tsx, once for each node detected

export interface IWaypointProps {
  isSelected: boolean;
}

const WaypointIcon = ({ isSelected }: IWaypointProps) => {
  return (
    <img
      className={"drop-shadow-lg"}
      src={isSelected ? SelectedWaypoint : DefaultWaypoint}
    />
  );
};
export default WaypointIcon;
