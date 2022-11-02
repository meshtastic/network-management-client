import React from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, ScaleControl } from "react-map-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import "./Map.css";
// import "./Mapstyle";

const MapBox = () => {
  // Start location
  const start_lat = 43.705621;
  const start_long = -72.291194;
  const start_zoom = 14;

  return (
    <div className="relative h-full w-full">
      <Map
        // MapStyle stolen from the Meshtastic Web map. Will change style later
        // mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapStyle="https://raw.githubusercontent.com/openmaptiles/maptiler-terrain-gl-style/master/style.json"
        // Allows for overwriting Mapbox with Maplibre
        mapLib={maplibregl}
        // Deletes credits at bottom of map
        attributionControl={false}
        // Starting position
        initialViewState={{
          latitude: start_lat,
          longitude: start_long,
          zoom: start_zoom,
        }}
      >
        {/* Prevents Scrollbar */}
        <ScaleControl maxWidth={144} position="bottom-right" unit="imperial" />
        {/* Adds a scale to the bottom */}
        <NavigationControl position="bottom-right" showCompass={false} />
      </Map>
    </div>
  );
};

export default MapBox;
