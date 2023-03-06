import React from "react"; //,  useState, useEffect, useCallback
import { deviceSliceActions } from "@features/device/deviceSlice";

import { useSelector, useDispatch } from "react-redux";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

import {
  XMarkIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { requestNewWaypoint } from "@features/device/deviceActions";

import { selectActiveWaypoint } from "@app/features/device/deviceSelectors";
import { writeValueToClipboard } from "@utils/clipboard";

const WaypointMenu = () => {
  const dispatch = useDispatch();
  const activeWaypoint = useSelector(selectActiveWaypoint());
  const waypointLat = activeWaypoint?.latitudeI
    ? (activeWaypoint.latitudeI / 1e7).toString()
    : null;
  const waypointLong = activeWaypoint?.longitudeI
    ? (activeWaypoint.longitudeI / 1e7).toString()
    : null;
  const waypointTitle = activeWaypoint?.name;
  const waypointDescription = activeWaypoint?.description;

  const handleClickDelete = () => {
    console.log("Clicked delete");
    if (activeWaypoint) {
      const updatedWaypoint: Waypoint = {
        ...activeWaypoint,
        expire: 1, // Set expiry time to 1970
      };
      dispatch(requestNewWaypoint({ waypoint: updatedWaypoint, channel: 0 }));
    } else {
      console.log("Error: No active waypoint");
    }
    dispatch(deviceSliceActions.setActiveWaypoint(null));
  };

  const handleClickEdit = () => {
    console.log("Clicked edit");
    dispatch(deviceSliceActions.setWaypointEdit(true));
  };

  if (!activeWaypoint) {
    return <></>;
  } else {
    return (
      <div className="absolute top-24 right-9 bg-white pt-5 pr-5 pb-3 pl-4 rounded-lg drop-shadow-lg w-80">
        <div className="flex justify-between">
          <h1 className="text-gray-600 text-2xl leading-5 font-semibold ">
            {/* If waypoint has no title / empty string for a title*/}
            {!waypointTitle || waypointTitle?.length == 0
              ? "No Title"
              : waypointTitle}
          </h1>
          <button
            type="button"
            onClick={() => dispatch(deviceSliceActions.setActiveWaypoint(null))}
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <h4 className="text-gray-500 text-base leading-6 font-semibold pt-2">
          Description
        </h4>
        <h3 className="text-gray-500 text-base leading-5 font-normal py-1">
          {!waypointDescription || waypointDescription?.length == 0
            ? "No Description"
            : waypointDescription}
        </h3>

        <h4 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
          Details
        </h4>

        <div className="flex flex-col">
          <div className="flex justify-between pb-1">
            <div className="flex justify-start">
              <ClockIcon className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
              <h3 className="text-gray-500 text-base leading-6 font-normal pl-2 mr-2">
                Pin last edited {`{do we have this}`} ago
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                void writeValueToClipboard("Time clipboard :) clicky clicky")
              }
            >
              <DocumentDuplicateIcon className="w-5 h-5 float-right text-gray-500" />
            </button>
          </div>

          <div className="flex justify-between pb-1">
            <div className="flex justify-start">
              <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
              <h3 className="text-gray-500 text-base leading-6 font-normal pl-2">
                {waypointLat == null || waypointLong == null
                  ? "No location data"
                  : "(" + waypointLat + ", " + waypointLong + ")"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => void writeValueToClipboard("clacky clacky")}
            >
              <DocumentDuplicateIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <hr className="my-2" />
        </div>

        <div className="flex flex-row justify-evenly space-x-8 mt-3 mb-2 ">
          <button
            className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
            onClick={() => handleClickDelete()}
          >
            <div className="self-center pr-2 text-gray-500 text-base font-semibold">
              Trash
            </div>
            <TrashIcon className="self-center text-gray-500 w-10 my-2 p-1" />
          </button>

          <button
            className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
            onClick={() => handleClickEdit()}
          >
            <div className="self-center pr-2 text-gray-500 text-base font-semibold">
              Edit
            </div>
            <PencilSquareIcon className="self-center text-gray-500 w-10 my-2 p-1" />
          </button>
        </div>
      </div>
    );
  }
};

export default WaypointMenu;
