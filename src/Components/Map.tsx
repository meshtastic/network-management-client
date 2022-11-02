import React from "react";
import maplibregl from "maplibre-gl";
import { Map } from "react-map-gl";

const MapBox = () => {
  return (
    <div className="Map_Class">
      <Map
        mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapLib={maplibregl}
        attributionControl={false}
      ></Map>
    </div>
  );
};

export default MapBox;
