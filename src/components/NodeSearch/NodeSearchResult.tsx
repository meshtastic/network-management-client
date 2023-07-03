import React from "react";
import TimeAgo from "timeago-react";
import { Locate, LocateFixed } from "lucide-react";

import type { app_device_MeshNode } from "@bindings/index";

import { useComponentReload } from "@utils/hooks";
import {
  getColorClassFromNodeState,
  getLastHeardTime,
  getNodeState,
  getMinsSinceLastHeard,
} from "@utils/nodes";

export interface INodeSearchResultProps {
  node: app_device_MeshNode;
  isActive: boolean;
  selectNode: (nodeId: number) => void;
}

const NodeSearchResult = ({
  node,
  isActive,
  selectNode,
}: INodeSearchResultProps) => {
  useComponentReload(1000);

  const lastPacketTime = getLastHeardTime(node);
  const nodeState = getNodeState(getMinsSinceLastHeard(node), isActive);
  const colorClasses = getColorClassFromNodeState(nodeState);

  return (
    <div className="flex flex-row gap-4">
      <div className={`flex-grow ${colorClasses.text}`}>
        <p className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {node.user?.longName ?? node.nodeNum}
          <span className="pl-2 text-xs font-normal">
            {lastPacketTime ? (
              <TimeAgo datetime={lastPacketTime * 1000} locale="en-us" live />
            ) : (
              "UNK"
            )}
          </span>
        </p>
        <p className="text-sm font-light">
          {!!node.positionMetrics.at(-1)?.latitude &&
          !!node.positionMetrics.at(-1)?.longitude
            ? `${node.positionMetrics.at(-1)?.latitude ?? ""}°, ${
                node.positionMetrics.at(-1)?.longitude ?? ""
              }°`
            : "No GPS lock, hidden from map"}
        </p>
      </div>

      {isActive ? (
        <LocateFixed
          className={`w-6 h-6 mx-0 my-auto ${colorClasses.text} hover:cursor-pointer`}
          onClick={() => selectNode(node.nodeNum)}
          strokeWidth={1.5}
        />
      ) : (
        <Locate
          className={`w-6 h-6 mx-0 my-auto ${colorClasses.text} hover:cursor-pointer`}
          onClick={() => selectNode(node.nodeNum)}
          strokeWidth={1.5}
        />
      )}
    </div>
  );
};

export default NodeSearchResult;
