import { GeoJsonLayer, type GeoJsonLayerProps } from "deck.gl/typed";
import { CollisionFilterExtension } from "@deck.gl/extensions/typed";

import type { MeshGraph } from "@app/types/graph";
import type { app_device_MeshNode } from "@bindings/index";
import { trace } from "tauri-plugin-log-api";

const convertGraphNodesToFeatureCollection = (
  graph: MeshGraph["graph"],
  nodes: app_device_MeshNode[],
) => {
  const graphNodes = graph.nodes.reduce<GeoJSON.Feature[]>((accum, node) => {
    const ownNode = nodes.find((n) => n.nodeNum === node.nodeNum);

    if (!ownNode) {
      trace(`No node found for graph node ${node.nodeNum}`);
      return accum;
    }

    const lastPositionMetric =
      ownNode.positionMetrics[ownNode.positionMetrics.length - 1];

    if (!lastPositionMetric) {
      trace(`No position metrics for node ${ownNode.nodeNum}`);
      return accum;
    }

    const { latitude, longitude } = lastPositionMetric;

    if (!latitude || !longitude) {
      trace(`No latitude or longitude for node ${ownNode.nodeNum}`);
      return accum;
    }

    return [
      ...accum,
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          id: ownNode.nodeNum,
          num: ownNode.nodeNum,
        },
      },
    ];
  }, []);

  return {
    type: "FeatureCollection",
    features: [...graphNodes],
  };
};

export const createGraphNodesLayer = (
  graph: MeshGraph["graph"] | null,
  nodes: app_device_MeshNode[],
  activeNodeId: number | null,
  handleNodeClick: GeoJsonLayerProps["onClick"],
  handleNodeHover: GeoJsonLayerProps["onHover"],
): GeoJsonLayer => {
  return new GeoJsonLayer({
    id: "nodes",
    pointType: "circle",
    data: graph ? convertGraphNodesToFeatureCollection(graph, nodes) : {},

    pickable: true,
    stroked: false,

    onClick: handleNodeClick,
    onHover: handleNodeHover,

    pointRadiusUnits: "pixels",
    getPointRadius: (info) => {
      if (activeNodeId && info.properties?.num === activeNodeId) {
        return 6;
      }

      return 4;
    },

    getFillColor: (info) => {
      if (activeNodeId && info.properties?.num === activeNodeId) {
        return [59, 130, 246];
      }

      return [55, 65, 81];
    },

    extensions: [new CollisionFilterExtension()],

    updateTriggers: {
      getFillColor: { activeNodeId },
      getPointRadius: { activeNodeId },
    },

    transitions: {
      getFillColor: 40,
      getPointRadius: 40,
    },
  });
};
