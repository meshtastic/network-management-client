import React from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, ScaleControl } from "react-map-gl";

import MapNode from "@components/Map/MapNode";
import NodeSearchDock from "@components/NodeSearch/NodeSearchDock";

import { selectActiveNode, selectAllNodes } from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";

import "./MapView.css";

export const MapView = () => {
  const nodes = useSelector(selectAllNodes());
  const dispatch = useDispatch();
  const activeNodeId = useSelector(selectActiveNode());

  const updateActiveNode = (nodeId: number | null) => {
    dispatch(deviceSliceActions.setActiveNode(nodeId));
  }

  return (
    <div className="relative w-full h-full">
      <Map
        mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapLib={maplibregl}
        attributionControl={false}
      >
        <ScaleControl maxWidth={144} position="bottom-right" unit="imperial" />
        <NavigationControl position="bottom-right" showCompass={false} />

        {nodes.map(node => (
          <MapNode
            key={node.data.num}
            onClick={updateActiveNode}
            node={node}
            isBase={false}
            isActive={activeNodeId === node.data.num}
          />
        ))}

        <NodeSearchDock />
      </Map>
    </div>
  );
};
