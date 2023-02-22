import React from "react";

import BaseIcon from "@app/assets/map-nodes/Size=Medium, State=Nominal, IsBase=True.svg";
import NominalNodeIcon from "@app/assets/map-nodes/Size=Medium, State=Nominal, IsBase=False.svg";
import SelectedNodeIcon from "@app/assets/map-nodes/Size=Large, State=Selected, IsBase=False.svg";
import WarningNodeIcon from "@app/assets/map-nodes/Size=Medium, State=Warning, IsBase=False.svg";
import ErrorNodeIcon from "@app/assets/map-nodes/Size=Medium, State=Error, IsBase=False.svg";

import type { NodeState } from "@utils/nodeUtils";

export interface IMapNodeIconProps {
  size: "sm" | "med" | "lg";
  state: NodeState;
  isBase: boolean;
  className?: string;
}

const MapNodeIcon = ({
  size,
  state,
  isBase,
  className = "",
}: IMapNodeIconProps) => {
  if (isBase) return <img src={BaseIcon} />;

  switch (state) {
    case "selected":
      return <img className={className} src={SelectedNodeIcon} />;

    case "warning":
      return <img className={className} src={WarningNodeIcon} />;

    case "error":
      return <img className={className} src={ErrorNodeIcon} />;

    // Nominal
    default:
      return <img className={className} src={NominalNodeIcon} />;
  }
};

export default MapNodeIcon;
