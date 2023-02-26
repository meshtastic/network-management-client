import React from "react";
import { Marker, MapboxEvent } from "react-map-gl";
import TimeAgo from "timeago-react";

import type { MeshNode } from "@bindings/MeshNode";
import MapNodeIcon from "@components/Map/MapNodeIcon";

import { useComponentReload } from "@utils/hooks";
import {
  getMinsSinceLastHeard,
  getNodeState,
  getHeadingFromNodeState,
  getColorClassFromNodeState,
  getLastHeardTime,
} from "@utils/nodeUtils";

export interface IMapNodeProps {
  node: MeshNode;
  onClick: (nodeId: number | null) => void;
  size?: "sm" | "med" | "lg";
  isBase?: boolean;
  isActive?: boolean;
}

const MapNode = ({
  node,
  onClick,
  size = "med",
  isBase = false,
  isActive = false,
}: IMapNodeProps) => {
  useComponentReload(1000);

  const lastPacketTime = getLastHeardTime(node);
  const nodeState = getNodeState(getMinsSinceLastHeard(node), isActive);
  const headingPrefix = getHeadingFromNodeState(nodeState, isBase);

  const colorClasses = getColorClassFromNodeState(nodeState);
  const iconRotation = !isBase ? node.data.position?.groundTrack ?? 0 : 0;

  const handleNodeClick = (e: MapboxEvent<MouseEvent>) => {
    e.originalEvent.preventDefault();
    onClick(node.data.num);
  };

  return (
    <Marker
      latitude={(node.data.position?.latitudeI ?? 0) / 1e7}
      longitude={(node.data.position?.longitudeI ?? 0) / 1e7}
      onClick={handleNodeClick}
    >
      <div className="relative">
        <div
          className="absolute left-2/4 text-center whitespace-nowrap px-2 py-1 default-overlay text-xs"
          style={{ transform: "translate(-50%, -120%)" }}
        >
          {headingPrefix && (
            <span className={`font-bold ${colorClasses.text}`}>
              {headingPrefix}{" "}
            </span>
          )}
          <span className={`font-normal ${colorClasses.text}`}>
            {node.data.user?.longName ?? node.data.num}
          </span>
          {(nodeState === "warning" || nodeState === "error") && (
            <span className={`font-normal ${colorClasses.text}`}>
              {" "}
              <TimeAgo datetime={lastPacketTime} locale="en-us" live />
            </span>
          )}
        </div>

        <div style={{ transform: `rotate(${iconRotation}deg)` }}>
          <MapNodeIcon
            size={size}
            state={nodeState}
            isBase={isBase}
            className="drop-shadow-lg"
          />
        </div>
      </div>
    </Marker>
  );
};

export default MapNode;
