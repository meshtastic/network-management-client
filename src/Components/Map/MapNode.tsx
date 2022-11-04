import React from 'react';
import { Marker } from 'react-map-gl';

import MapNodeIcon, { NodeState } from './MapNodeIcon';
import type { IDevice } from '@features/device/deviceSlice';

// TODO these will need to be configurable
export const NODE_WARNING_THRESHOLD = 15;
export const NODE_ERROR_THRESHOLD = 30;

export interface IMapNodeProps {
  device: IDevice;
  size?: 'sm' | 'med' | 'lg'
  isBase?: boolean;
}

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

const MapNode = ({ device, size = 'med', isBase = false }: IMapNodeProps) => {
  const timeSinceLastMessage = 4; // TODO make this live data
  const nodeState = getNodeState(timeSinceLastMessage);
  const headingPrefix = getHeadingFromNodeState(nodeState, isBase);

  const showMessageTime = nodeState === 'warning' || nodeState === 'error';
  const colorClass = getColorClassFromNodeState(nodeState);
  const iconRotation = !isBase ? device.position?.groundTrack ?? 0 : 0;

  return (
    <Marker
      latitude={(device.position?.latitudeI ?? 0) / 1e7}
      longitude={(device.position?.longitudeI ?? 0) / 1e7}
    >
      <div className='relative'>
        <div className="absolute left-2/4 text-center whitespace-nowrap px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-lg text-xs" style={{ transform: "translate(-50%, -120%)" }}>
          {headingPrefix && <span className={`font-bold ${colorClass}`}>{headingPrefix} </span>}
          <span className={`font-normal ${colorClass}`}>{device.user?.longName ?? device.id}</span>
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
