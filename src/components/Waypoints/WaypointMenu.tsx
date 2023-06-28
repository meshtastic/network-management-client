import React from "react"; //,  useState, useEffect, useCallback
import { useSelector, useDispatch } from "react-redux";

import {
  XMarkIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { requestDeleteWaypoint } from "@features/device/deviceActions";
import {
  selectActiveWaypoint,
  selectPrimaryDeviceKey,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";

import { writeValueToClipboard } from "@utils/clipboard";
import { formatLocation } from "@utils/map";

// This file contains the WaypointMenu component when it is not being edited
// It is called in MapView.tsx

const WaypointMenu = () => {
  const dispatch = useDispatch();
  const activeWaypoint = useSelector(selectActiveWaypoint());
  const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());

  // Only show if there is an active waypoint
  if (!activeWaypoint) return null;

  const handleDeleteWaypoint = () => {
    if (!primaryDeviceKey) {
      console.warn("No primary device key set, cannot delete waypoint");
      return;
    }

    dispatch(
      requestDeleteWaypoint({
        deviceKey: primaryDeviceKey,
        waypointId: activeWaypoint.id,
      })
    );
  };

  const { name, description, latitudeI, longitudeI } = activeWaypoint;

  return (
    <div className="absolute top-24 right-9 bg-white pt-5 pr-5 pb-3 pl-4 rounded-lg drop-shadow-lg w-80">
      <div className="flex justify-between">
        <h1 className="text-gray-600 text-2xl leading-5 font-semibold ">
          {name || "No title"}
        </h1>

        <button
          type="button"
          onClick={() => dispatch(deviceSliceActions.setActiveWaypoint(null))}
        >
          <XMarkIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="text-gray-500 text-base">
        <h2 className="leading-6 font-semibold pt-2">Description</h2>
        <h2 className="leading-5 font-normal py-1">
          {description || "No description"}
        </h2>
      </div>

      <h2 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
        Details
      </h2>

      <div className="flex flex-col">
        <div className="flex justify-between pb-1 text-gray-500">
          <div className="flex justify-start">
            <MapPinIcon className="w-5 h-5  mt-0.5" />
            <h2 className="text-base leading-6 font-normal pl-2">
              {latitudeI && longitudeI
                ? `(${formatLocation(latitudeI / 1e7)} lat, ${formatLocation(
                    longitudeI / 1e7
                  )} lon)`
                : "No location set"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              void writeValueToClipboard(
                latitudeI && longitudeI
                  ? `(${latitudeI / 1e7}, ${longitudeI / 1e7})`
                  : "No location set"
              )
            }
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
          </button>
        </div>
        <hr className="my-2" />
      </div>

      <div className="flex flex-row justify-evenly space-x-8 mt-3 mb-2 text-gray-500 text-base font-semibold">
        <button
          className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
          onClick={handleDeleteWaypoint}
        >
          <div className="self-center pr-2">Trash</div>
          <TrashIcon className="self-center w-10 my-2 p-1" />
        </button>
      </div>
    </div>
  );
};

export default WaypointMenu;
