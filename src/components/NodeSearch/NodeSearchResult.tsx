import React, { useCallback, useEffect, useState } from "react";
import {
  ShieldExclamationIcon,
  SignalIcon,
  SignalSlashIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";

import type { MeshNode } from "@bindings/MeshNode";
import {
  getColorClassFromNodeState,
  getNodeState,
  getTimeSinceLastMessage,
  NodeState,
} from "@utils/nodeUtils";

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
  const [timeSinceLastMessage, setTimeSinceLastMessage] = useState(0);

  const nodeState = getNodeState(timeSinceLastMessage, isActive);
  const colorClasses = getColorClassFromNodeState(nodeState);

  const reloadTimeSinceLastMessage = useCallback(() => {
    setTimeSinceLastMessage(getTimeSinceLastMessage(node));
  }, [setTimeSinceLastMessage, node]);

  useEffect(() => {
    const intervalId = setInterval(reloadTimeSinceLastMessage, 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-row gap-4">
      <_NodeSearchResultIcon nodeState={nodeState} />

      <div className={`flex-grow ${colorClasses.text}`}>
        <p className="text-lg font-semibold">
          {node.data.user?.longName ?? node.data.num}
          <span className="text-sm font-normal pl-2">
            {timeSinceLastMessage} min
          </span>
        </p>
        {/* <p>{Buffer.from(node.data.user?.macaddr ?? []).toString('hex')}</p> */}
        <p className="text-sm font-light">demo mac address</p>
      </div>

      <ViewfinderCircleIcon
        className={`w-6 h-6 mx-0 my-auto ${colorClasses.text} hover:cursor-pointer`}
        onClick={() => selectNode(node.data.num)}
      />
    </div>
  );
};

export default NodeSearchResult;
