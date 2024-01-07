import type { PickingInfo } from "deck.gl/typed";

export interface IMapEdgeTooltip {
  hoverInfo: PickingInfo;
}

const MapEdgeTooltip = ({ hoverInfo }: IMapEdgeTooltip) => {
  const { object, x, y } = hoverInfo;

  const snr = object?.properties?.snr;

  if (!snr) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 text-center whitespace-nowrap px-2 py-1 default-overlay text-xs text-gray-500"
      style={{ left: x, top: y }}
    >
      <p>SNR: {snr}</p>
    </div>
  );
};

export default MapEdgeTooltip;
