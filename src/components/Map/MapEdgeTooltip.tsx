import type { PickingInfo } from "deck.gl/typed";
import React from "react";

export interface IMapEdgeTooltip {
  hoverInfo: PickingInfo;
}

const MapEdgeTooltip = ({ hoverInfo }: IMapEdgeTooltip) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { object, x, y } = hoverInfo;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const snr = object?.properties?.snr;

  if (!snr) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 bg-white border border-gray-100 rounded-lg px-2 py-1 text-sm text-gray-700 shadow-md"
      style={{ left: x, top: y }}
    >
      <p>SNR: {snr}</p>
    </div>
  );
};

export default MapEdgeTooltip;
