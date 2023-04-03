import React from "react";
import { useSelector, useDispatch } from "react-redux";
import TimeAgo from "timeago-react";
import {
  XMarkIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  Battery50Icon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";

import { selectActiveNode } from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { writeValueToClipboard } from "@utils/clipboard";
import { useComponentReload } from "@utils/hooks";
import { getLastHeardTime } from "@utils/nodes";

const MapSelectedNodeMenu = () => {
  const dispatch = useDispatch();
  const activeNode = useSelector(selectActiveNode());
  useComponentReload(1000);

  const lastPacketTime = activeNode ? getLastHeardTime(activeNode) : 0;

  const deviceName = activeNode?.data.user?.longName ?? "N/A";
  const deviceLtCoord = (activeNode?.data.position?.latitudeI ?? 0) / 1e7;
  const deviceLgCoord = (activeNode?.data.position?.longitudeI ?? 0) / 1e7;
  const deviceSpeed = activeNode?.data.position?.groundSpeed ?? 0;
  const deviceDirection = activeNode?.data.position?.groundTrack ?? 0;

  const clearActiveNode = () => {
    dispatch(deviceSliceActions.setActiveNode(null));
  };

  const getBatteryStateString = () => {
    const devicePercentCharge =
      activeNode?.data.deviceMetrics?.batteryLevel ?? null;

    if (!devicePercentCharge) return "Unknown";
    if (devicePercentCharge === 101) return "Powered";
    return `${devicePercentCharge}%, discharging`;
  };

  if (!activeNode) return <></>;

  return (
    <div className="absolute top-24 right-9 bg-white p-5 pl-4 rounded-lg drop-shadow-lg w-80">
      <div className="flex justify-between">
        <h1 className="text-gray-600 text-2xl leading-5 font-semibold">
          {deviceName}
        </h1>
        <button type="button" onClick={clearActiveNode}>
          <XMarkIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <p className="text-gray-500 text-sm leading-5 font-normal pt-1">
        Last heard from{" "}
        {lastPacketTime ? (
          <TimeAgo datetime={lastPacketTime} locale="en_us" />
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
            <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
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
            <DocumentDuplicateIcon className="w-5 h-5 float-right text-gray-500" />
          </button>
        </div>

        <div className="flex justify-between pb-1">
          <div className="flex justify-start">
            <Battery50Icon className="w-5 h-5 text-gray-500 mt-0.5" />
            <h2 className="text-gray-500 text-base leading-6 font-normal pl-2">
              {getBatteryStateString()}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void writeValueToClipboard(getBatteryStateString())}
          >
            <DocumentDuplicateIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex justify-between pb-1">
          <div className="flex justify-start">
            <ArrowRightCircleIcon className="w-5 h-5 outline-gray-400 mt-0.5 text-gray-500" />
            <h2 className="text-gray-500 text-base leading-6 font-normal pl-2">
              {!deviceSpeed || !deviceDirection ? (
                <span>Unknown</span>
              ) : (
                <span>
                  {deviceSpeed} mph, {deviceDirection % 360}&#176;
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              void writeValueToClipboard(
                `${deviceSpeed} mph, ${deviceDirection}deg`
              )
            }
          >
            <DocumentDuplicateIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapSelectedNodeMenu;
