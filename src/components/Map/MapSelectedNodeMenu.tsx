import React from "react";
import { useSelector, useDispatch } from "react-redux";
import TimeAgo from "timeago-react";
import {
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Copy,
  MapPin,
  PlugZap,
  X,
} from "lucide-react";

import { selectActiveNode } from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { writeValueToClipboard } from "@utils/clipboard";
import { useComponentReload } from "@utils/hooks";
import { getLastHeardTime } from "@utils/nodes";

export interface IBatteryLevelIconProps {
  batteryLevel: number | null;
  className?: string;
}

const BatteryLevelIcon = ({
  batteryLevel,
  className = "",
}: IBatteryLevelIconProps) => {
  // No info
  if (!batteryLevel) return <Battery strokeWidth={1.5} className={className} />;

  // Plugged in
  if (batteryLevel > 100)
    return <PlugZap strokeWidth={1.5} className={className} />;

  if (batteryLevel > 75)
    return <BatteryFull strokeWidth={1.5} className={className} />;

  if (batteryLevel > 50)
    return <BatteryMedium strokeWidth={1.5} className={className} />;

  if (batteryLevel > 25)
    return <BatteryLow strokeWidth={1.5} className={className} />;

  return <BatteryWarning strokeWidth={1.5} className={className} />;
};

const getBatteryStateString = (batteryLevel: number | null) => {
  if (!batteryLevel) return "Unknown";
  if (batteryLevel > 100) return "Powered";
  return `${batteryLevel}%, discharging`;
};

const MapSelectedNodeMenu = () => {
  const dispatch = useDispatch();
  const activeNode = useSelector(selectActiveNode());
  useComponentReload(1000);

  if (!activeNode) return <></>;

  const lastPacketTime = getLastHeardTime(activeNode);

  const deviceName = activeNode.data.user?.longName ?? "N/A";
  const deviceLtCoord = (activeNode.data.position?.latitudeI ?? 0) / 1e7;
  const deviceLgCoord = (activeNode.data.position?.longitudeI ?? 0) / 1e7;
  const batteryLevel =
    activeNode.deviceMetrics.at(-1)?.metrics.batteryLevel ?? null;

  const clearActiveNode = () => {
    dispatch(deviceSliceActions.setActiveNode(null));
  };

  return (
    <div className="absolute top-24 right-9 bg-white p-5 pl-4 rounded-lg drop-shadow-lg w-80">
      <div className="flex justify-between">
        <h1 className="text-gray-600 text-2xl leading-5 font-semibold">
          {deviceName}
        </h1>
        <button type="button" onClick={clearActiveNode}>
          <X strokeWidth={1.5} className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <p className="text-gray-500 text-sm leading-5 font-normal pt-1">
        Last heard from{" "}
        {lastPacketTime ? (
          <TimeAgo datetime={lastPacketTime * 1000} locale="en_us" />
        ) : (
          "Unknown"
        )}
      </p>

      <h2 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
        General Information
      </h2>
      <div className="flex flex-col">
        <div className="flex justify-between pb-1">
          <div className="flex justify-start">
            <MapPin
              className="w-5 h-5 text-gray-500 mt-0.5"
              strokeWidth={1.5}
            />
            <h2 className="text-gray-500 text-base leading-6 font-normal pl-2">
              {!deviceLtCoord || !deviceLgCoord ? (
                <span>Unknown</span>
              ) : (
                <span>
                  {deviceLtCoord}&#176;, {deviceLgCoord}&#176;
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              void writeValueToClipboard(
                `${deviceLtCoord}deg, ${deviceLgCoord}deg`
              )
            }
          >
            <Copy
              strokeWidth={1.5}
              className="w-5 h-5 float-right text-gray-500"
            />
          </button>
        </div>

        <div className="flex justify-between pb-1">
          <div className="flex justify-start">
            <BatteryLevelIcon
              batteryLevel={batteryLevel}
              className="w-5 h-5 text-gray-500 mt-0.5"
            />
            <h2 className="text-gray-500 text-base leading-6 font-normal pl-2">
              {getBatteryStateString(batteryLevel)}
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              void writeValueToClipboard(getBatteryStateString(batteryLevel))
            }
          >
            <Copy
              strokeWidth={1.5}
              className="w-5 h-5 float-right text-gray-500"
            />
          </button>
        </div>

        {/* TODO add neighbors */}
      </div>
    </div>
  );
};

export default MapSelectedNodeMenu;
