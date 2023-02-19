import React from "react";
import {
  // MapIconButton,
  MapIconUnimplemented,
} from "@components/Map/MapIconButton";
import { MapPinIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";

// Currently implemented using MapIconUnimplemented, which allows for a popup.
// When functionality is implemented, change component to MapIconButton.

const MapInteractionPane = () => {
  return (
    <div className="absolute top-9 right-9 flex gap-4">
      <MapIconUnimplemented
        className="p-2 text-gray-500"
        onClick={() => console.log("Map Pin icon clicked")}
      >
        <MapPinIcon className="w-6 h-6" />
      </MapIconUnimplemented>

      <MapIconUnimplemented
        className="p-2 text-gray-500"
        onClick={() => console.log("Square Stack icon clicked")}
      >
        <Square3Stack3DIcon className="w-6 h-6" />
      </MapIconUnimplemented>
    </div>
  );
};

export default MapInteractionPane;
