import React from "react";
import maplibregl from "maplibre-gl";
import { Map, ScaleControl } from "react-map-gl";

const MapBox = () => {
  return (
    <div className="relative w-full h-full">
      <Map
        mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapLib={maplibregl}
        attributionControl={false}
      >
        <ScaleControl position="bottom-right" unit="imperial" />
      </Map>
    </div>
  );
};

export default MapBox;
