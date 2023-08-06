import type { PickingInfo } from "deck.gl/typed";
import React from "react";
import { useSelector } from "react-redux";

import { selectNodeById } from "@features/device/deviceSelectors";
import { selectRootState } from "@features/ui/selectors";

export interface IMapNodeTooltip {
  hoverInfo: PickingInfo;
}

const MapNodeTooltip = ({ hoverInfo }: IMapNodeTooltip) => {
  const rootState = useSelector(selectRootState());

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { object, x, y } = hoverInfo;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const num: number | null = object?.properties?.num;

  if (!num) return null;

  // Calling this way to avoid conditional selector usage
  const nodeInfo = selectNodeById(num)(rootState);

  if (!nodeInfo) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 text-center whitespace-nowrap px-2 py-1 default-overlay text-xs text-gray-500"
      style={{ left: x, top: y }}
    >
      <p>Name: {nodeInfo.user?.longName ?? "UNK"}</p>
    </div>
  );
};

export default MapNodeTooltip;
