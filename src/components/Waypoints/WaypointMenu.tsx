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
  selectDevice,
  selectPrimaryDeviceKey,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";

import { writeValueToClipboard } from "@utils/clipboard";
import { formatLocation } from "@utils/map";
import { getWaypointTitle } from "@utils/messaging";
import type { app_device_NormalizedWaypoint } from "@app/bindings";
import { Pencil } from "lucide-react";

// This file contains the WaypointMenu component when it is not being edited
// It is called in MapView.tsx

export interface IWaypointMenuProps {
  editWaypoint: (waypoint: app_device_NormalizedWaypoint) => void;
}

const WaypointMenu = ({ editWaypoint }: IWaypointMenuProps) => {
  const dispatch = useDispatch();
  const activeWaypoint = useSelector(selectActiveWaypoint());
  const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());
  const device = useSelector(selectDevice());

  // Only show if there is an active waypoint
  if (!activeWaypoint) return null;

  const handleEditWaypoint = () => {
    if (!primaryDeviceKey) {
      console.warn("No primary device key set, cannot edit waypoint");
      return;
    }

    editWaypoint(activeWaypoint);
  };

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

  const { description, latitude, longitude } = activeWaypoint;

  return (
    <div className="absolute top-24 right-9 bg-white pt-5 pr-5 pb-3 pl-4 rounded-lg drop-shadow-lg w-80">
      <button
        className="absolute top-5 right-5"
        type="button"
        onClick={() => dispatch(deviceSliceActions.setActiveWaypoint(null))}
      >
        <XMarkIcon className="w-5 h-5 text-gray-500" />
      </button>

      <h1 className="mr-8 text-gray-600 text-2xl leading-5 font-semibold break-words">
        {getWaypointTitle(activeWaypoint)}
      </h1>

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
              {latitude && longitude
                ? `(${formatLocation(latitude)} lat, ${formatLocation(
                    longitude
                  )} lon)`
                : "No location set"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              void writeValueToClipboard(
                latitude && longitude
                  ? `(${latitude}, ${longitude})`
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
          disabled={
            !!activeWaypoint.lockedTo &&
            activeWaypoint.lockedTo !== device?.myNodeInfo.myNodeNum
          }
          onClick={handleEditWaypoint}
        >
          <div className="self-center pr-2">Edit</div>
          <Pencil strokeWidth={1.5} className="self-center w-10 my-2 p-1" />
        </button>

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
