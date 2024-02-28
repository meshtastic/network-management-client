import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { invoke } from "@tauri-apps/api";
import {
  GraphCanvas,
  GraphNode as VisGraphNode,
  GraphEdge as VisGraphEdge,
} from "reagraph";
import uniqBy from "lodash.uniqby";

import { MeshGraph } from "@app/types/graph";
import { NavigationBacktrace } from "@components/NavigationBacktrace";
import { selectAllNodes } from "@features/device/selectors";

export const GraphDebuggerPage = () => {
  const { t } = useTranslation();

  const [graph, setGraph] = useState<MeshGraph | null>(null);

  const nodes = useSelector(selectAllNodes());

  const fetchGraph = async () => {
    const graph: MeshGraph = await invoke("get_graph_state");
    setGraph(graph);
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const graphNodes =
    uniqBy(
      graph?.graph.nodes.map<VisGraphNode>((n) => ({
        id: `${n.nodeNum}`,
        label:
          nodes.find((sn) => sn.nodeNum === n.nodeNum)?.user?.longName ||
          `${n.nodeNum}`,
      })),
      (val) => val.id,
    ) ?? [];

  const graphEdges =
    uniqBy(
      graph?.graph.edges.map<VisGraphEdge>(([, , e]) => {
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
