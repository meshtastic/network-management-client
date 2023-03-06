import React from "react";

import BaseIcon from "@app/assets/map-nodes/Size=Medium, State=Nominal, IsBase=True.svg";
import ErrorNodeIcon from "@app/assets/map-nodes/Size=Medium, State=Error, IsBase=False.svg";
import SelectedWaypoint from "@app/assets/waypoints/waypoint_selected.svg";
import DefaultWaypoint from "@app/assets/waypoints/waypoint_default.svg";

export interface IWaypointProps {
  isSelected: boolean;
  expired: boolean;
}

const WaypointIcon = ({ isSelected, expired }: IWaypointProps) => {
  return (
    <img
      className={""}
      src={expired ? "" : isSelected ? BaseIcon : ErrorNodeIcon}
    />
  );
};
export default WaypointIcon;
