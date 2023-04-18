import type { PickingInfo } from "deck.gl/typed";
import React from "react";

export interface IMapEdgeTooltip {
  hoverInfo: PickingInfo | null;
}

const MapEdgeTooltip = ({ hoverInfo }: IMapEdgeTooltip) => {
  if (!hoverInfo) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { object, x, y } = hoverInfo;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const snr = object?.properties?.snr || 0;

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{ left: x, top: y }}
    >
      SNR: {snr}
    </div>
  );
};

export default MapEdgeTooltip;
