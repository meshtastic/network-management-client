import React from "react";

import { useSelector, useDispatch } from "react-redux";
import { Lightbulb, MapPin } from "lucide-react";

import { MapIconButton } from "@components/Map/MapIconButton";
import { deviceSliceActions } from "@features/device/deviceSlice";
import {
  selectAllowOnMapWaypointCreation,
  selectInfoPane,
} from "@features/device/deviceSelectors";

const MapInteractionPane = () => {
  const dispatch = useDispatch();

  const newWaypoint = useSelector(selectAllowOnMapWaypointCreation());
  const accordionShown = useSelector(selectInfoPane()) === "algos";

  // Toggles newWaypoint state, which allows for creation of new waypoints on map
  const handleClickMapPin = () => {
    dispatch(deviceSliceActions.setAllowOnMapWaypointCreation(!newWaypoint));
  };

  const handleClickStacks = () => {
    dispatch(deviceSliceActions.setInfoPane(accordionShown ? null : "algos"));
  };

  return (
    <div className="absolute top-9 right-9 flex gap-4">
      {/* Toggles newWaypoint state */}
      <MapIconButton selected={newWaypoint} onClick={handleClickMapPin}>
        <MapPin
          strokeWidth={1.5}
          className={`w-6 h-6 text-gray-400 ${
            newWaypoint ? "text-gray-200" : "text-gray-500"
          }`}
        />
      </MapIconButton>

      <MapIconButton selected={accordionShown} onClick={handleClickStacks}>
        <Lightbulb
          strokeWidth={1.5}
          className={`w-6 h-6 ${
            accordionShown ? "text-gray-200" : "text-gray-500"
          }`}
        />
      </MapIconButton>
    </div>
  );
};

export default MapInteractionPane;
