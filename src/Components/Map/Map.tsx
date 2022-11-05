import React from "react";
import maplibregl from "maplibre-gl";
import { Map, NavigationControl, ScaleControl } from "react-map-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import "./Map.css";
// import "./Mapstyle";

const MapBox = () => {
  // Start location
  const start_lat = 44.270384;
  const start_long = -71.303365;
  const start_zoom = 14;

  // Sherry Map key
  const api_key = "E2zc32QIleYbvvlOblEa";

  return (
    <div className="relative h-full w-full">
      <Map
        // Allows for overwriting Mapbox with Maplibre
        mapLib={maplibregl}
        // MapStyle from Maptiler - Outdoors  https://cloud.maptiler.com/maps/outdoor/
        mapStyle={
          // "https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
          "https://api.maptiler.com/maps/outdoor/style.json?key=" + api_key
        }
        // Starting position
        initialViewState={{
          latitude: start_lat,
          longitude: start_long,
          zoom: start_zoom,
        }}
        // Deletes credits at bottom of map
        attributionControl={false}
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
