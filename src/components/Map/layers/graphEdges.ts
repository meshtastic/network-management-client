import { trace } from "tauri-plugin-log-api";
import { GeoJsonLayer, GeoJsonLayerProps } from "deck.gl/typed";
import { PathStyleExtension } from "@deck.gl/extensions/typed";

import { MeshGraph } from "@app/types/graph";
import { app_device_MeshNode } from "@bindings/index";

const convertGraphEdgesToFeatureCollection = (
  graph: MeshGraph["graph"],
  nodes: app_device_MeshNode[],
): GeoJSON.FeatureCollection => {
  const graphEdges = graph.edges.reduce<GeoJSON.Feature[]>(
    (accum, [fromNodeIndex, toNodeIndex, edge]) => {
      const { from: fromNodeNum, to: toNodeNum, snr } = edge;

      const sourceGraphNode = graph.nodes[fromNodeIndex] ?? null;
      const targetGraphNode = graph.nodes[toNodeIndex] ?? null;

      if (!sourceGraphNode || !targetGraphNode) {
        trace("Missing source or target graph node for edge");
        return accum;
      }

      const sourceNode = nodes.find((node) => node.nodeNum === fromNodeNum);
      const targetNode = nodes.find((node) => node.nodeNum === toNodeNum);

      if (!sourceNode || !targetNode) {
        trace("Missing source or target node for edge");
        return accum;
      }

      const lastSourcePositionMetric =
        sourceNode.positionMetrics[sourceNode.positionMetrics.length - 1];
      const lastTargetPositionMetric =
        targetNode.positionMetrics[targetNode.positionMetrics.length - 1];

      if (!lastSourcePositionMetric || !lastTargetPositionMetric) {
        trace("Missing source or target position metric for edge");
        return accum;
      }

      if (
        !lastSourcePositionMetric.latitude ||
        !lastSourcePositionMetric.longitude
      ) {
        trace("Missing source latitude or longitude for edge");
        return accum;
      }

      if (
        !lastTargetPositionMetric.latitude ||
        !lastTargetPositionMetric.longitude
      ) {
        trace("Missing target latitude or longitude for edge");
        return accum;
      }

      return [
        ...accum,
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [
                lastSourcePositionMetric.longitude,
                lastSourcePositionMetric.latitude,
              ],
              [
                lastTargetPositionMetric.longitude,
                lastTargetPositionMetric.latitude,
              ],
            ],
          },
          properties: {
            from: fromNodeNum,
            to: toNodeNum,
            snr,
          },
        } as GeoJSON.Feature,
      ];
    },
    [] as GeoJSON.Feature[],
  );

  return {
    type: "FeatureCollection",
    features: graphEdges,
  };
};

export const createGraphEdgesLayer = (
  graph: MeshGraph["graph"] | null,
  nodes: app_device_MeshNode[],
  onEdgeHover: GeoJsonLayerProps["onHover"],
) => {
  return new GeoJsonLayer({
    id: "edges",
    data: graph ? convertGraphEdgesToFeatureCollection(graph, nodes) : {},
    pointType: "circle",
    extensions: [new PathStyleExtension({ dash: true })],
    getDashArray: [4, 4],
    pickable: true,
    dashJustified: true,
    dashGapPickable: true,
    filled: false,
    lineWidthMinPixels: 2,

    onHover: onEdgeHover,

    getLineColor: () => {
      return [55, 65, 81];
    },
  });
};
