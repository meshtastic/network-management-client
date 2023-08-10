import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { GraphCanvas, GraphNode, GraphEdge } from "reagraph";

import NavigationBacktrace from "@components/NavigationBacktrace";
import {
  selectAllNodesRecord,
  selectAllUsersByNodeIds,
  selectNeighbors,
} from "@features/device/selectors";

const ApplicationGraphPage = () => {
  const { t } = useTranslation();

  const neighbors = useSelector(selectNeighbors());
  const users = useSelector(selectAllUsersByNodeIds());
  const nodes = useSelector(selectAllNodesRecord());

  const backtrace = [t("sidebar.applicationGraph")];

  const graphNodes: GraphNode[] = useMemo(
    () =>
      neighbors
        ? Object.entries(neighbors).map(([id, _packet]) => {
            const longName = users?.[parseInt(id) ?? 0]?.longName;
            const position = nodes?.[parseInt(id) ?? 0]?.positionMetrics.at(-1);

            const latitude = position?.latitude.toFixed(4) ?? 0;
            const longitude = position?.longitude.toFixed(4) ?? 0;

            return {
              id,
              label:
                longName && position
                  ? `${longName}\n(${latitude}, ${longitude})`
                  : `Unknown node ${id}`,
            };
          })
        : [],
    [neighbors, users]
  );

  const graphEdges: GraphEdge[] = useMemo(
    () =>
      neighbors
        ? Object.entries(neighbors).flatMap<GraphEdge>(([id, packet]) =>
            // Always keep graph undirected by including two edges
            packet.data.neighbors.flatMap<GraphEdge>((n) => [
              {
                id: `${id}-${n.nodeId}`,
                source: id,
                target: n.nodeId.toString(),
                labelVisible: true,
              },
              {
                id: `${n.nodeId}-${id}`,
                source: n.nodeId.toString(),
                target: id,
                labelVisible: false,
              },
            ])
          )
        : [],

    [neighbors]
  );

  return (
    <div className="flex flex-col w-full h-screen bg-white dark:bg-gray-800">
      <div className="flex justify-center align-middle px-9 min-h-[5rem] border-b border-gray-100 dark:border-gray-700">
        <NavigationBacktrace className="my-auto mr-auto" levels={backtrace} />
      </div>

      <div className="relative px-9 py-6 w-full h-full">
        <GraphCanvas
          nodes={graphNodes}
          edges={graphEdges}
          layoutType="radialOut2d"
        />
      </div>
    </div>
  );
};

export default ApplicationGraphPage;
