import React from "react"; //,  useState, useEffect, useCallback
import { useSelector, useDispatch } from "react-redux";

import {
  XMarkIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { useDeleteWaypoint, useToggleEditWaypoint } from "@app/utils/waypoint";
import { writeValueToClipboard } from "@utils/clipboard";
import { selectActiveWaypoint } from "@app/features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";

// This file contains the WaypointMenu component when it is not being edited
// It is called in MapView.tsx

const WaypointMenu = () => {
  const dispatch = useDispatch();
  const activeWaypoint = useSelector(selectActiveWaypoint());

  // Waypoint information
  const waypointTitle = activeWaypoint?.name;
  const waypointDescription = activeWaypoint?.description;
  const waypointLong = activeWaypoint?.longitudeI
    ? (activeWaypoint.longitudeI / 1e7).toString()
    : null;
  const waypointLat = activeWaypoint?.latitudeI
    ? (activeWaypoint.latitudeI / 1e7).toString()
    : null;

  // Waypoint Utils, used when the buttons at bottom are clicked
  const deleteWaypoint = useDeleteWaypoint();
  const toggleEditWaypoint = useToggleEditWaypoint();

  // Only show if there is an active waypoint
  if (!activeWaypoint) {
    return <></>;
  } 
    return (
      <div className="absolute top-24 right-9 bg-white pt-5 pr-5 pb-3 pl-4 rounded-lg drop-shadow-lg w-80">
        <div className="flex justify-between">
          {/* Title */}
          <h1 className="text-gray-600 text-2xl leading-5 font-semibold ">
            {/* If waypoint has no title / empty string for a title*/}
            {!waypointTitle || waypointTitle?.length == 0
              ? "No Title"
              : waypointTitle}
          </h1>

          {/* X-button */}
          <button
            type="button"
            onClick={() => dispatch(deviceSliceActions.setActiveWaypoint(null))}
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <div className="text-gray-500 text-base">
          <h4 className="leading-6 font-semibold pt-2">Description</h4>
          <h3 className="leading-5 font-normal py-1">
            {!waypointDescription || waypointDescription?.length == 0
              ? "No Description"
              : waypointDescription}
          </h3>
        </div>

        {/* Details */}
        <h4 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
          Details
        </h4>
        <div className="flex flex-col">
          {/* Location data */}
          <div className="flex justify-between pb-1 text-gray-500">
            <div className="flex justify-start">
              <MapPinIcon className="w-5 h-5  mt-0.5" />
              <h3 className="text-base leading-6 font-normal pl-2">
                {waypointLat && waypointLong ? "(" + waypointLat + ", " + waypointLong + ")" : "No location data"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                void writeValueToClipboard(
                  waypointLat && waypointLong ? "(" + waypointLat + ", " + waypointLong + ")" : "No location data")
              }
            >
              <DocumentDuplicateIcon className="w-5 h-5" />
            </button>
          </div>
          <hr className="my-2" />
        </div>

        {/* Delete / Edit */}
        <div className="flex flex-row justify-evenly space-x-8 mt-3 mb-2 text-gray-500 text-base font-semibold">
          <button
            className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
            onClick={deleteWaypoint}
          >
            <div className="self-center pr-2">Trash</div>
            <TrashIcon className="self-center w-10 my-2 p-1" />
          </button>

          <button
            className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
            onClick={toggleEditWaypoint}
          >
            <div className="self-center pr-2">Edit</div>
            <PencilSquareIcon className="self-center w-10 my-2 p-1" />
          </button>
        </div>
      </div>
    );

};

export default WaypointMenu;
