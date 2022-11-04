import React, { useState } from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, ScaleControl } from "react-map-gl";
import type { ITemporaryNode } from "@app/components/Map/MapNode";
import MapNode from "@components/Map/MapNode";

import "./MapView.css";


export const MapView = () => {
  const [nodes, setNodes] = useState<Record<string, ITemporaryNode>>({
    1: {
      heading: 112,
      name: "Meshtastic f578",
      timeSinceLastMessage: 30,
      latitude: 43.705621,
      longitude: -72.291194,
      isBase: false,
    },
    2: {
      heading: 18,
      name: "Meshtastic f378",
      timeSinceLastMessage: 15,
      latitude: 43.705215,
      longitude: -72.29454,
      isBase: false,
    },
    3: {
      heading: 112,
      name: "Meshtastic f221",
      timeSinceLastMessage: 5,
      latitude: 43.707565,
      longitude: -72.29200,
      isBase: false,
    },
    4: {
      heading: 112,
      name: "Meshtastic f842",
      timeSinceLastMessage: 5,
      latitude: 43.707415,
      longitude: -72.29004,
      isBase: true,
    }
  });

  return (
    <div className="relative w-full h-full">
      <Map
        mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapLib={maplibregl}
        attributionControl={false}
      >
        <ScaleControl maxWidth={144} position="bottom-right" unit="imperial" />
        <NavigationControl position="bottom-right" showCompass={false} />

        {Object.values(nodes).map(node => (<MapNode key={node.name} node={node} isBase={node.isBase} />))}
      </Map>
    </div>
  );
};
