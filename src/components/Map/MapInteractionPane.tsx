import React from "react";
import {
  MapIconButton,
  MapIconUnimplemented,
} from "@components/Map/MapIconButton";
import { MapPinIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";

import { useSelector, useDispatch } from "react-redux";

import type { Waypoint } from "@bindings/protobufs/Waypoint";

import { requestNewWaypoint } from "@features/device/deviceActions";
import { selectDevice } from "@features/device/deviceSelectors";

// Currently implemented using MapIconUnimplemented, which allows for a popup.
// When functionality is implemented, change component to MapIconButton.

const MapInteractionPane = () => {
  // Currently, this button is being used to test waypoint sending.
  const dispatch = useDispatch();
  const nodles = useSelector(selectDevice());
  const handleClick = () => {
    const newWaypoint: Waypoint = {
      id: 1, // No idea how to come up with this
      latitudeI: Math.round(0),
      longitudeI: Math.round(0),
      expire: 1708116114, // 2024 2/16
      lockedTo: 0, // Protobuf need updating
      name: "Waypoint 1",
      description: "hoohoo",
      icon: 128529, // (-_-) emoji
      // https://www.npmjs.com/package/emoji-js
    };
    dispatch(requestNewWaypoint({ waypoint: newWaypoint, channel: 0 }));

    const newWaypoint2: Waypoint = {
      id: 2, // No idea how to come up with this
      latitudeI: Math.round(12 * 1e7),
      longitudeI: Math.round(12 * 1e7),
      expire: 1708116114, // 2024 2/16
      lockedTo: 0, // Protobuf need updating
      name: "",
      description: "waypoint 2; no name testing",
      icon: 128529, // -_- emoji
    };
    dispatch(requestNewWaypoint({ waypoint: newWaypoint2, channel: 0 }));

    const newWaypoint3: Waypoint = {
      id: 3, // No idea how to come up with this
      latitudeI: Math.round(24 * 1e7),
      longitudeI: Math.round(56 * 1e7),
      expire: 1708116114, // 2024 2/16
      lockedTo: 0, // Protobuf need updating
      name: "Waypoint3",
      description: "",
      icon: 128529, // -_- emoji
    };
    dispatch(requestNewWaypoint({ waypoint: newWaypoint3, channel: 0 }));

    console.log(nodles ? nodles.waypoints : "no waypoints");
  };

  //// Start deleting from before this
  return (
    <div className="absolute top-9 right-9 flex gap-4">
      <MapIconButton
        className="p-2 text-gray-500"
        onClick={() => handleClick()}
      >
        <MapPinIcon className="w-6 h-6" />
      </MapIconButton>

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
