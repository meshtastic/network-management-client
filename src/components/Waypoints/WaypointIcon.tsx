import React from "react";

import BaseIcon from "@app/assets/map-nodes/Size=Medium, State=Nominal, IsBase=True.svg";
import DefaultWaypoint from "@app/assets/waypoint.svg";
import ErrorNodeIcon from "@app/assets/map-nodes/Size=Medium, State=Error, IsBase=False.svg";

const WaypointIcon = ({ isSelected }: { isSelected: boolean }) => {
  return <img className={""} src={isSelected ? ErrorNodeIcon : BaseIcon} />;
};
export default WaypointIcon;
