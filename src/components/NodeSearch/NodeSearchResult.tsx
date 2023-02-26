import React from "react";
import TimeAgo from "timeago-react";
import {
  ShieldExclamationIcon,
  SignalIcon,
  SignalSlashIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";

import type { MeshNode } from "@bindings/MeshNode";
import { useComponentReload } from "@utils/hooks";
import {
  getColorClassFromNodeState,
  getLastHeardTime,
  getNodeState,
  getMinsSinceLastHeard,
  NodeState,
} from "@utils/nodes";

export interface INodeSearchResultProps {
  node: MeshNode;
  isActive: boolean;
  selectNode: (nodeId: number) => void;
}

interface _INodeSearchResultIconProps {
  nodeState: NodeState;
}

const _NodeSearchResultIcon = ({ nodeState }: _INodeSearchResultIconProps) => {
  switch (nodeState) {
    case "selected":
      return <SignalIcon className="w-6 h-6 mx-0 my-auto text-blue-500" />;

    case "warning":
      return (
        <SignalSlashIcon className="w-6 h-6 mx-0 my-auto text-orange-500" />
      );

    case "error":
      return (
        <ShieldExclamationIcon className="w-6 h-6 mx-0 my-auto text-red-500" />
      );

    default:
      return <SignalIcon className="w-6 h-6 mx-0 my-auto text-gray-500" />;
  }
};

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
      <_NodeSearchResultIcon nodeState={nodeState} />

      <div className={`flex-grow ${colorClasses.text}`}>
        <p className="text-lg font-semibold">
          {node.data.user?.longName ?? node.data.num}
          <span className="text-sm font-normal pl-2">
            <TimeAgo datetime={lastPacketTime} locale="en-us" live />
          </span>
        </p>
        <p className="text-sm font-light">
          {!!node.data.position?.latitudeI && !!node.data.position?.longitudeI
            ? `${node.data.position.latitudeI / 1e7}, ${
                node.data.position.longitudeI / 1e7
              }`
            : "No GPS lock, hidden from map"}
        </p>
      </div>

      <ViewfinderCircleIcon
        className={`w-6 h-6 mx-0 my-auto ${colorClasses.text} hover:cursor-pointer`}
        onClick={() => selectNode(node.data.num)}
      />
    </div>
  );
};

export default NodeSearchResult;
