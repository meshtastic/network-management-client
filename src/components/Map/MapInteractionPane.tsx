import React from "react";

import { useSelector, useDispatch } from "react-redux";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectAllowOnMapWaypointCreation, selectShowAlgosAccordion } from "@features/device/deviceSelectors";

import {
  MapIconButton,
  MapIconUnimplemented,
} from "@components/Map/MapIconButton";
import { MapPinIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";

const MapInteractionPane = () => {
  const dispatch = useDispatch();

  const newWaypoint = useSelector(selectAllowOnMapWaypointCreation());
  const accordionShown = useSelector(selectShowAlgosAccordion());


  // Toggles newWaypoint state, which allows for creation of new waypoints on map
  const handleClickMapPin = () => {
    dispatch(deviceSliceActions.setAllowOnMapWaypointCreation(!newWaypoint));
  };

  const handleClickStacks = () => {
    dispatch(deviceSliceActions.setShowAlgosAccordion(!accordionShown
      ));
  };

  return (
    <div className="absolute top-9 right-9 flex gap-4">
      {/* Toggles newWaypoint state */}
      <MapIconButton
        className={`p-2 text-gray-500 ${
          newWaypoint ? "bg-gray-200" : "bg-white"
        } `}
        onClick={handleClickMapPin}
      >
        <MapPinIcon className="w-6 h-6" />
      </MapIconButton>

      {/* Currently implemented using MapIconUnimplemented, which allows for an error popup. */}
      {/* When functionality is implemented, change component to MapIconButton. */}
      <MapIconButton
        className={`p-2 text-gray-500 ${
          accordionShown ? "bg-gray-200" : "bg-white"
        } `}
        onClick={handleClickStacks}
      >
        <Square3Stack3DIcon className="w-6 h-6" />
      </MapIconButton>
    </div>
  );
};

export default MapInteractionPane;
