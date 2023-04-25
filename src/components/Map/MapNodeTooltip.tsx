import {
  selectNodeById,
  selectRootState,
} from "@app/features/device/deviceSelectors";
import type { PickingInfo } from "deck.gl/typed";
import React from "react";
import { useSelector } from "react-redux";

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
      className="pointer-events-none absolute z-10 bg-white border border-gray-100 rounded-lg px-2 py-1 text-sm text-gray-700 shadow-md"
      style={{ left: x, top: y }}
    >
      <p>Name: {nodeInfo.data.user?.longName ?? "UNK"}</p>
    </div>
  );
};

export default MapNodeTooltip;
