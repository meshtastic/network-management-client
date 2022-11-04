import React from "react";
import { useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import { Map, Marker, NavigationControl, ScaleControl } from "react-map-gl";

import { selectAllDevices } from "@features/device/deviceSelectors";

import 'maplibre-gl/dist/maplibre-gl.css';
import "./Map.css";

const MapBox = () => {
  const devices = useSelector(selectAllDevices());

  return (
    <div className="relative w-full h-full">
      <Map
        mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
        mapLib={maplibregl}
        attributionControl={false}
      >
        <ScaleControl maxWidth={144} position="bottom-right" unit="imperial" />
        <NavigationControl position="bottom-right" showCompass={false} />
        {devices.map(d => (
          <Marker
            key={d.id}
            rotation={(d.position?.groundTrack ?? 0) / 100}
            latitude={d.position?.latitudeI ?? 0}
            longitude={d.position?.longitudeI ?? 0}
          >
            Hi!
          </Marker>
        ))}
      </Map>
    </div>
  );
};

export default MapBox;
