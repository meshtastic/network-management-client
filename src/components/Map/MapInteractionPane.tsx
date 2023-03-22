import React from "react";

import { useSelector, useDispatch } from "react-redux";
import { deviceSliceActions } from "@features/device/deviceSlice";
import {
  selectAllowOnMapWaypointCreation,
  selectInfoPane,
} from "@features/device/deviceSelectors";

import { MapIconButton } from "@components/Map/MapIconButton";
import {
  MapPinIcon,
  Square3Stack3DIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const MapInteractionPane = () => {
  const dispatch = useDispatch();

  const newWaypoint = useSelector(selectAllowOnMapWaypointCreation());
  const accordionShown =
    useSelector(selectInfoPane()) == "algos" ? true : false;

  // Toggles newWaypoint state, which allows for creation of new waypoints on map
  const handleClickMapPin = () => {
    dispatch(deviceSliceActions.setAllowOnMapWaypointCreation(!newWaypoint));
  };

  const handleClickStacks = () => {
    dispatch(deviceSliceActions.setInfoPane(accordionShown ? null : "algos"));
  };

  const handleClickSparks = () => {
    console.log("temp sanity check placehold");
  };

  return (
    <div className="absolute top-9 right-9 flex gap-4">
      <MapIconButton selected={false} onClick={handleClickSparks}>
        <SparklesIcon
          className={`w-6 h-6 text-gray-400 ${
            newWaypoint ? "text-gray-200" : "text-gray-500"
          }`}
        />
      </MapIconButton>

      {/* Toggles newWaypoint state */}
      <MapIconButton selected={newWaypoint} onClick={handleClickMapPin}>
        <MapPinIcon
          className={`w-6 h-6 text-gray-400 ${
            newWaypoint ? "text-gray-200" : "text-gray-500"
          }`}
        />
      </MapIconButton>

      <MapIconButton selected={accordionShown} onClick={handleClickStacks}>
        <Square3Stack3DIcon
          className={`w-6 h-6 ${
            accordionShown ? "text-gray-200" : "text-gray-500"
          }`}
        />
      </MapIconButton>
    </div>
  );
};

export default MapInteractionPane;
