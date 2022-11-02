import React from 'react';
import MapNodeIcon, { NodeState } from './MapNodeIcon';
import { Marker } from 'react-map-gl';

// ! This is a temporary interface, this should not be used in prod
export interface ITemporaryNode {
  name: string;
  timeSinceLastMessage: number; // min
  heading: number; // deg
  latitude: number;
  longitude: number;
}

// TODO these will need to be configurable
export const NODE_WARNING_THRESHOLD = 15;
export const NODE_ERROR_THRESHOLD = 30;

export interface IMapNodeProps {
  node: ITemporaryNode;
  size?: 'sm' | 'med' | 'lg'
  isBase?: boolean;
}

export const getNodeState = (timeSinceLastMessage: number): NodeState => {
  if (timeSinceLastMessage >= NODE_ERROR_THRESHOLD) return 'error';
  if (timeSinceLastMessage >= NODE_WARNING_THRESHOLD) return 'warning';
  return 'nominal';
};

export const getHeadingFromNodeState = (nodeState: NodeState): string => {
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

const MapNode = ({ node, size = 'med', isBase = false }: IMapNodeProps) => {
  const nodeState = getNodeState(node.timeSinceLastMessage);
  const headingPrefix = getHeadingFromNodeState(nodeState);

  const showMessageTime = nodeState === 'warning' || nodeState === 'error';
  const colorClass = getColorClassFromNodeState(nodeState);

  return (
    <Marker
      latitude={node.latitude}
      longitude={node.longitude}
    >
      <div className="absolute whitespace-nowrap px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-lg text-xs" style={{ transform: "translate(-40%, -120%)" }}>
        {headingPrefix && <span className={`font-bold ${colorClass}`}>{headingPrefix} </span>}
        <span className={`font-normal ${colorClass}`}>{node.name}</span>
        {showMessageTime && (<span className={`font-normal ${colorClass}`}> ({node.timeSinceLastMessage} min)</span>)}
      </div>

      <div className='shadow-lg' style={{ transform: `rotate(${node.heading}deg)` }}>
        <MapNodeIcon
          size={size}
          state={nodeState}
          isBase={isBase}
        />
      </div>
    </Marker>
  );
};

export default MapNode;
