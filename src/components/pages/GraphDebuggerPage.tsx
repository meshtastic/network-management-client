import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  GraphCanvas,
  type GraphNode as VisGraphNode,
  type GraphEdge as VisGraphEdge,
} from "reagraph";
import uniqBy from "lodash.uniqby";

import { NavigationBacktrace } from "@components/NavigationBacktrace";
import { selectAllNodes } from "@features/device/selectors";
import { useGraphApi } from "@features/graph/api";
import { selectGraph } from "@features/graph/selectors";

export const GraphDebuggerPage = () => {
  const { t } = useTranslation();

  const graphApi = useGraphApi();

  const graph = useSelector(selectGraph());
  const nodes = useSelector(selectAllNodes());

  useEffect(() => {
    graphApi.fetchGraph();
  }, []);

  const graphNodes =
    uniqBy(
      graph?.nodes.map<VisGraphNode>((n) => ({
        id: `${n.nodeNum}`,
        label:
          nodes.find((sn) => sn.nodeNum === n.nodeNum)?.user?.longName ||
          `${n.nodeNum}`,
      })),
      (val) => val.id,
    ) ?? [];

  const graphEdges =
    uniqBy(
      graph?.edges.map<VisGraphEdge>(([, , e]) => {
        return {
          source: `${e.from}`,
          target: `${e.to}`,
          label: `${e.snr}`,
          id: `${e.from}-${e.to}`,
        };
      }),
      (val) => val.id,
    ) ?? [];

  return (
    <div className="flex flex-col w-full h-screen bg-white dark:bg-gray-800">
      <div className="flex justify-center align-middle px-9 min-h-[5rem] border-b border-gray-100 dark:border-gray-700">
        <NavigationBacktrace
          className="my-auto mr-auto"
          levels={[t("sidebar.graphDebugger")]}
        />
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
