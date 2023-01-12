import React from "react";
import MapIconButton from "@components/Map/MapIconButton";
import { MapPinIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";
import { useAlert } from "react-alert";

const MapInteractionPane = () => {
  const alertNotif = useAlert();

  return (
    <div className="absolute top-9 right-9 flex gap-4">
      <MapIconButton
        className="p-2 text-gray-500"
        onClick={() => {
          alertNotif.info(
            <div style={{ textTransform: "initial" }}>
              This functionality is not implemented
            </div>
          );
        }}
      >
        <MapPinIcon className="w-6 h-6" />
      </MapIconButton>

      <MapIconButton
        className="p-2 text-gray-500"
        onClick={() => {
          alertNotif.info(
            <div style={{ textTransform: "initial" }}>
              This functionality is not implemented
            </div>
          );
        }}
      >
        <Square3Stack3DIcon className="w-6 h-6" />
      </MapIconButton>
    </div>
  );
};

export default MapInteractionPane;
