import React from 'react';
import { Marker } from 'react-map-gl';

import MapNodeIcon, { NodeState } from './MapNodeIcon';
import type { INode } from '@features/device/deviceSlice';

// TODO these will need to be configurable
export const NODE_WARNING_THRESHOLD = 15;
export const NODE_ERROR_THRESHOLD = 30;

export const getNodeState = (timeSinceLastMessage: number): NodeState => {
  if (timeSinceLastMessage >= NODE_ERROR_THRESHOLD) return 'error';
  if (timeSinceLastMessage >= NODE_WARNING_THRESHOLD) return 'warning';
  return 'nominal';
};

export const getHeadingFromNodeState = (nodeState: NodeState, isBase = false): string => {
  if (isBase) return "Base";

  switch (nodeState) {
    case 'selected':
      return "Selected";

    case 'warning':
      return "Warning";

    case 'error':
      return "Error";

    // Nominal
    default:
      return "";
  }
};

export const getColorClassFromNodeState = (nodeState: NodeState): string => {
  switch (nodeState) {
    case 'selected':
      return "text-blue-500";

    case 'warning':
      return "text-orange-500";

    case 'error':
      return "text-red-500";

    // Nominal
    default:
      return "text-gray-500";
  }
}

export interface IMapNodeProps {
  node: INode;
  onClick: (nodeId: number | null) => void;
  size?: 'sm' | 'med' | 'lg'
  isBase?: boolean;
}

const MapNode = ({ node, onClick, size = 'med', isBase = false }: IMapNodeProps) => {
  const lastHeard = node.data.lastHeard !== 0 ? node.data.lastHeard : Date.now(); // sec, 0 means not set
  const now = Date.now() / 1000; // sec
  const timeSinceLastMessage = Math.abs(now - lastHeard) / 60; // s to min

  const nodeState = getNodeState(timeSinceLastMessage);
  const headingPrefix = getHeadingFromNodeState(nodeState, isBase);

  const showMessageTime = nodeState === 'warning' || nodeState === 'error';
  const colorClass = getColorClassFromNodeState(nodeState);
  const iconRotation = !isBase ? node.data.position?.groundTrack ?? 0 : 0;

  const handleNodeClick = (e: mapboxgl.MapboxEvent<MouseEvent>) => {
    e.originalEvent.preventDefault();
    onClick(node.data.num);
  }

  return (
    <Marker
      latitude={(node.data.position?.latitudeI ?? 0) / 1e7}
      longitude={(node.data.position?.longitudeI ?? 0) / 1e7}
      onClick={handleNodeClick}
    >
      <div className='relative'>
        <div className="absolute left-2/4 text-center whitespace-nowrap px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-lg text-xs" style={{ transform: "translate(-50%, -120%)" }}>
          {headingPrefix && <span className={`font-bold ${colorClass}`}>{headingPrefix} </span>}
          <span className={`font-normal ${colorClass}`}>{node.data.user?.longName ?? node.data.num}</span>
          {showMessageTime && (<span className={`font-normal ${colorClass}`}> ({timeSinceLastMessage} min)</span>)}
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
