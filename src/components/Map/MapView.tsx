import React from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, ScaleControl } from "react-map-gl";

import MapInteractionPane from "@components/Map/MapInteractionPane";
import MapNode from "@components/Map/MapNode";
import NodeSearchDock from "@components/NodeSearch/NodeSearchDock";

import {
  selectActiveNode,
  selectAllNodes,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectActiveSidebarPanel } from "@features/panels/panelsSelectors";
import type { ActiveSidebarPanel } from "@features/panels/panelsSlice";

import "./MapView.css";

interface _IMapViewLeftPanel {
  activeSidebarPanel: ActiveSidebarPanel;
}

const _MapViewLeftPanel = ({ activeSidebarPanel }: _IMapViewLeftPanel) => {
  switch (activeSidebarPanel) {
    case "map":
      return <NodeSearchDock />;

    default:
      return <></>;
  }
};

export const MapView = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes());
  const activeNodeId = useSelector(selectActiveNode());
  const activeSidebarPanel = useSelector(selectActiveSidebarPanel());

  const updateActiveNode = (nodeId: number | null) => {
    dispatch(deviceSliceActions.setActiveNode(nodeId));
  };

  return (
    <div className="relative w-full h-full">
      <Map
        mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapLib={maplibregl}
        attributionControl={false}
      >
        <ScaleControl maxWidth={144} position="bottom-right" unit="imperial" />
        <NavigationControl position="bottom-right" showCompass={false} />

        {nodes.map((node) => (
          <MapNode
            key={node.data.num}
            onClick={updateActiveNode}
            node={node}
            isBase={false}
            isActive={activeNodeId === node.data.num}
          />
        ))}

        <_MapViewLeftPanel activeSidebarPanel={activeSidebarPanel} />
        <MapInteractionPane />
      </Map>
    </div>
  );
};
