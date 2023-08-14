import React from "react";
import { Trans, useTranslation } from "react-i18next";
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

import i18next from "@app/i18n";

import {
  selectAllUsersByNodeIds,
  selectNeighbors,
} from "@features/device/selectors";
import { selectActiveNode } from "@features/ui/selectors";
import { uiSliceActions } from "@features/ui/slice";

import { writeValueToClipboard } from "@utils/clipboard";
import { useComponentReload } from "@utils/hooks";
import { getLastHeardTime } from "@utils/nodes";
import { formatLocation } from "@utils/map";

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
  if (!batteryLevel) return i18next.t("map.panes.nodeInfo.battery.unknown");
  if (batteryLevel > 100)
    return i18next.t("map.panes.nodeInfo.battery.powered");
  return i18next.t("map.panes.nodeInfo.battery.discharging", { batteryLevel });
};

const MapSelectedNodeMenu = () => {
  const { t, i18n } = useTranslation();

  useComponentReload(1000);

  const dispatch = useDispatch();
  const activeNode = useSelector(selectActiveNode());
  const neighbors = useSelector(selectNeighbors());
  const users = useSelector(selectAllUsersByNodeIds());

  if (!activeNode) return <></>;

  const lastPacketTime = getLastHeardTime(activeNode);

  const deviceName = activeNode.user?.longName ?? t("general.notApplicable");
  const deviceLatCoord = activeNode.positionMetrics.at(-1)?.latitude ?? 0;
  const deviceLngCoord = activeNode.positionMetrics.at(-1)?.longitude ?? 0;
  const batteryLevel =
    activeNode.deviceMetrics.at(-1)?.metrics.batteryLevel ?? null;

  const setNewActiveNode = (nodeId: number) => {
    dispatch(uiSliceActions.setActiveNode(nodeId));
  };

  const clearActiveNode = () => {
    dispatch(uiSliceActions.setActiveNode(null));
  };

  return (
    <div className="absolute top-9 right-9 bg-white dark:bg-gray-800 p-5 pl-4 rounded-lg drop-shadow-lg w-80">
      <div className="flex justify-between">
        <h1 className="text-gray-600 dark:text-gray-400 text-2xl leading-5 font-semibold">
          {deviceName}
        </h1>
        <button type="button" onClick={clearActiveNode}>
          <X
            strokeWidth={1.5}
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
          />
        </button>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm leading-5 font-normal pt-1">
        <Trans
          i18nKey="map.panes.nodeInfo.lastHeard"
          components={{
            timeAgo: lastPacketTime ? (
              <TimeAgo
                datetime={lastPacketTime * 1000}
                locale={i18n.language}
              />
            ) : (
              <>{t("map.panes.nodeInfo.unknownValue")}</>
            ),
          }}
        />
      </p>

      <div>
        <h2 className="text-gray-600 dark:text-gray-400 text-base leading-6 font-semibold pt-2 pb-1">
          {t("map.panes.nodeInfo.generalInfo")}
        </h2>

        <div className="flex flex-col">
          <div className="flex justify-between pb-1">
            <div className="flex justify-start">
              <MapPin
                className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5"
                strokeWidth={1.5}
              />
              <h2 className="text-gray-500 dark:text-gray-400 text-base leading-6 font-normal pl-2">
                {!deviceLatCoord && !deviceLngCoord ? (
                  <span>{t("map.panes.nodeInfo.unknownValue")}</span>
                ) : (
                  <span>
                    {`${formatLocation(deviceLatCoord)}, ${formatLocation(
                      deviceLngCoord
                    )}`}
                  </span>
                )}
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                void writeValueToClipboard(
                  `${formatLocation(deviceLatCoord)}, ${formatLocation(
                    deviceLngCoord
                  )}`
                )
              }
            >
              <Copy
                strokeWidth={1.5}
                className="w-5 h-5 float-right text-gray-500 dark:text-gray-400"
              />
            </button>
          </div>

          <div className="flex justify-between pb-1">
            <div className="flex justify-start">
              <BatteryLevelIcon
                batteryLevel={batteryLevel}
                className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5"
              />
              <h2 className="text-gray-500 dark:text-gray-400 text-base leading-6 font-normal pl-2">
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
                className="w-5 h-5 float-right text-gray-500 dark:text-gray-400"
              />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-gray-600 dark:text-gray-400 text-base leading-6 font-semibold pt-2 pb-1">
            {t("map.panes.nodeInfo.neighborInfo")}
          </h2>

          {Object.keys(neighbors?.[activeNode.nodeNum]?.data.neighbors ?? {})
            .length ? (
            <div className="relative flex flex-row">
              <div className="w-0.5 bg-gray-400 dark:text-gray-500 ml-3 mr-6 mt-4" />

              <div className="relative flex flex-col">
                {Object.entries(
                  neighbors?.[activeNode.nodeNum]?.data.neighbors ?? {}
                ).map(([num, neighbor]) => (
                  <div key={num}>
                    <div className="relative -left-[28.5px] top-[16px] w-2 h-2 bg-gray-400 dark:text-gray-500 rounded-full" />

                    <button
                      type="button"
                      onClick={() => setNewActiveNode(neighbor.nodeId)}
                    >
                      <h3 className="m-0 font-medium text-gray-500 dark:text-gray-400">
                        {users?.[neighbor.nodeId]?.longName ?? neighbor.nodeId}
                      </h3>
                    </button>

                    <p className="m-0 text-gray-500 dark:text-gray-400">
                      <Trans
                        i18nKey="map.panes.nodeInfo.neighborInfoBlurb"
                        components={{
                          timeAgo: (
                            <TimeAgo
                              datetime={neighbor.lastRxTime * 1000}
                              locale={i18n.language}
                            />
                          ),
                        }}
                        values={{
                          interval: neighbor.nodeBroadcastIntervalSecs,
                          snr: neighbor.snr,
                        }}
                      />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {t("map.panes.nodeInfo.noNeighborsFound")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSelectedNodeMenu;
