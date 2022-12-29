import React from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, ScaleControl } from "react-map-gl";
import { useLocation, Location as RouterLocation } from "react-router-dom";

import MapInteractionPane from "@components/Map/MapInteractionPane";
import MapNode from "@components/Map/MapNode";
import NodeSearchDock from "@components/NodeSearch/NodeSearchDock";
import Settings from "@components/Settings/Settings";
import Messages from "@components/Messages/Messages";
import MapSelectedNodeMenu from "@components/Map/MapSelectedNodeMenu";

import {
  selectActiveNodeId,
  selectAllNodes,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";

import "./MapView.css";

interface _IMapViewLeftPanel {
  location: RouterLocation;
}

const _MapViewLeftPanel = ({ location }: _IMapViewLeftPanel) => {
  switch (location.hash) {
    case "#messages":
      return <Messages />;

    case "#settings":
      return <Settings />;

    default:
      return <NodeSearchDock />;
  }
};

export const MapView = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes());
  const activeNodeId = useSelector(selectActiveNodeId());
  const location = useLocation();

  const updateActiveNode = (nodeId: number | null) => {
    dispatch(deviceSliceActions.setActiveNode(nodeId));
  };

  return (
    <div className="relative w-full h-full z-0">
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

        <MapSelectedNodeMenu />
        <_MapViewLeftPanel location={location} />
        <MapInteractionPane />
      </Map>
    </div>
  );
};
