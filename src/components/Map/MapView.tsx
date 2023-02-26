import React from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import {
  Map,
  NavigationControl,
  ScaleControl,
  ViewStateChangeEvent,
} from "react-map-gl";

import MapInteractionPane from "@components/Map/MapInteractionPane";
import MapNode from "@components/Map/MapNode";
import NodeSearchDock from "@components/NodeSearch/NodeSearchDock";
import MapSelectedNodeMenu from "@components/Map/MapSelectedNodeMenu";

import {
  selectActiveNodeId,
  selectAllNodes,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectMapState } from "@features/map/mapSelectors";
import { mapSliceActions } from "@features/map/mapSlice";

import "@components/Map/MapView.css";

export const MapView = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes());
  const activeNodeId = useSelector(selectActiveNodeId());
  const mapState = useSelector(selectMapState());

  const updateActiveNode = (nodeId: number | null) => {
    if (nodeId === activeNodeId) {
      return dispatch(deviceSliceActions.setActiveNode(null));
    }

    dispatch(deviceSliceActions.setActiveNode(nodeId));
  };

  const handleMoveEnd = (e: ViewStateChangeEvent) => {
    dispatch(
      mapSliceActions.setPosition({
        latitude: e.viewState.latitude,
        longitude: e.viewState.longitude,
      })
    );
  };

  const handleZoomEnd = (e: ViewStateChangeEvent) => {
    dispatch(mapSliceActions.setZoom(e.viewState.zoom));
  };

  return (
    <div className="relative w-full h-full z-0">
      <Map
        initialViewState={mapState}
        mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapLib={maplibregl}
        attributionControl={false}
        onMoveEnd={handleMoveEnd}
        onZoomEnd={handleZoomEnd}
      >
        <ScaleControl maxWidth={144} position="bottom-right" unit="imperial" />
        <NavigationControl position="bottom-right" showCompass={false} />

        {nodes
          .filter(
            (n) => !!n.data.position?.latitudeI && !!n.data.position?.longitudeI
          )
          .map((node) => (
            <MapNode
              key={node.data.num}
              onClick={updateActiveNode}
              node={node}
              isBase={false}
              isActive={activeNodeId === node.data.num}
            />
          ))}

        <MapSelectedNodeMenu />
        <NodeSearchDock />
        <MapInteractionPane />
      </Map>
    </div>
  );
};
