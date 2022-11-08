import React from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, ScaleControl } from "react-map-gl";
import MapNode from "@components/Map/MapNode";

import "./MapView.css";
import { useSelector } from "react-redux";
import { selectAllNodes } from "@app/features/device/deviceSelectors";


export const MapView = () => {
  const nodes = useSelector(selectAllNodes());

  return (
    <div className="relative w-full h-full">
      <Map
        mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapLib={maplibregl}
        attributionControl={false}
      >
        <ScaleControl maxWidth={144} position="bottom-right" unit="imperial" />
        <NavigationControl position="bottom-right" showCompass={false} />

        {nodes.map(node => (<MapNode key={node.data.num} node={node} isBase={false} />))}
      </Map>
    </div>
  );
};
