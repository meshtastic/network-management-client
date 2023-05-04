import React, { useState, FormEventHandler } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "@material-tailwind/react";

import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

import type { app_protobufs_Waypoint } from "@bindings/index";

import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestNewWaypoint } from "@features/device/deviceActions";
import {
  selectPrimarySerialPort,
  selectActiveWaypoint,
  selectActiveWaypointID,
  selectPlaceholderWaypoint,
} from "@features/device/deviceSelectors";

import { useToggleEditWaypoint } from "@app/utils/hooks";

// This component contains the Waypoint Menu when it is not being edited
// It is called in MapView.tsx

const WaypointMenuEdit = () => {
  const dispatch = useDispatch();
  const activeWaypoint = useSelector(selectActiveWaypoint());
  const activeWaypointID = useSelector(selectActiveWaypointID());
  const primaryPortName = useSelector(selectPrimarySerialPort());

  const placeholderWaypoint = useSelector(selectPlaceholderWaypoint());

  // Waypoint info
  const [waypointTitle, setWaypointTitle] = useState(activeWaypoint?.name);
  const [waypointDescription, setWaypointDescription] = useState(
    activeWaypoint?.description
  );
  const waypointLat = activeWaypoint?.latitudeI
    ? (activeWaypoint.latitudeI / 1e7).toString()
    : null;
  const waypointLong = activeWaypoint?.longitudeI
    ? (activeWaypoint.longitudeI / 1e7).toString()
    : null;

  // Utils
  const toggleEditWaypoint = useToggleEditWaypoint();

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    const channelNum =
      Number((document.getElementById("channel") as HTMLInputElement).value) ??
      0;

    if (!primaryPortName) {
      console.warn("No primary serial port, not updating waypoint");
      return;
    }

    // If updating existing waypoint
    if (activeWaypoint) {
      const updatedWaypoint: app_protobufs_Waypoint = {
        ...activeWaypoint,
        name: waypointTitle ? waypointTitle : "",
        description: waypointDescription ? waypointDescription : "",
      };
      dispatch(
        requestNewWaypoint({
          portName: primaryPortName,
          waypoint: updatedWaypoint,
          channel: channelNum,
        })
      );
      dispatch(deviceSliceActions.setInfoPane("waypoint"));
    } else if (placeholderWaypoint && activeWaypointID === 0) {
      const updatedWaypoint: app_protobufs_Waypoint = {
        ...placeholderWaypoint,
        name: waypointTitle ? waypointTitle : "",
        description: waypointDescription ? waypointDescription : "",
      };

      dispatch(
        requestNewWaypoint({
          portName: primaryPortName,
          waypoint: updatedWaypoint,
          channel: channelNum,
        })
      );
      dispatch(deviceSliceActions.setInfoPane(null));
      dispatch(deviceSliceActions.setPlaceholderWaypoint(null));
    }
  };

  const handleClickCancel = () => {
    if (activeWaypointID) {
      toggleEditWaypoint();
    } else {
      dispatch(deviceSliceActions.setPlaceholderWaypoint(null));
      dispatch(deviceSliceActions.setInfoPane(null));
      dispatch(deviceSliceActions.setActiveWaypoint(null));
    }
  };

  const handleClickX = () => {
    dispatch(deviceSliceActions.setInfoPane(null));
    dispatch(deviceSliceActions.setActiveWaypoint(null));
    dispatch(deviceSliceActions.setPlaceholderWaypoint(null));
  };

  // Only display if there is a selected waypoint
  if (!activeWaypoint && activeWaypointID !== 0) {
    return null;
  }
  return (
    <div className="absolute top-24 right-9 bg-white py-3 pr-5 pl-4 rounded-lg drop-shadow-lg w-80">
      <form onSubmit={handleSubmit}>
        {/* Title, X-button */}
        <div className="flex justify-between">
          <h1 className="text-gray-500 text-base leading-6 font-semibold pt-2 ">
            Title
          </h1>
          <button type="button" onClick={handleClickX}>
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Change title */}
        <h2 className="text-gray-600 text-2xl leading-5 font-semibold ">
          <Input
            className="rounded-md bg-gray-100 p-4 w-11/12"
            type="text"
            size="lg"
            value={!waypointTitle ? "No Title" : waypointTitle}
            onChange={(e) => setWaypointTitle(e.target.value)}
            disabled={false}
          />
        </h2>

        {/* Description */}
        <h2 className="text-gray-500 text-base leading-6 font-semibold pt-2">
          Description
        </h2>
        <h2 className="text-gray-500 text-base leading-5 font-normal py-1">
          <Input
            className="rounded-md bg-gray-100 p-4 w-11/12"
            type="text"
            size="lg"
            value={
              !waypointDescription ? "No Description" : waypointDescription
            }
            onChange={(e) => setWaypointDescription(e.target.value)}
            disabled={false}
          />
        </h2>

        <h2 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
          Location
        </h2>
        <div className="flex flex-col">
          <div className="flex justify-between pb-1">
            <div className="flex justify-start">
              <h2 className="text-gray-500 text-base leading-5 font-normal ">
                {waypointLat == null || waypointLong == null
                  ? "No location data"
                  : "(" + waypointLat + ", " + waypointLong + ")"}
              </h2>
            </div>
          </div>

          <hr className="my-2" />
        </div>

        <h2 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
          Channel
        </h2>
        <div className=" ">
          <select
            id="channel"
            className="self-center bg-gray-100 p-2 w-11/12 rounded-md items-center text-gray-500 text-base font-normal "
          >
            <option value="0">Channel 0</option>
            <option value="1">Channel 1</option>
            <option value="2">Channel 2</option>
            <option value="3">Channel 3</option>
            <option value="4">Channel 4</option>
            <option value="5">Channel 5</option>
            <option value="6">Channel 6</option>
            <option value="7">Channel 7</option>
          </select>
        </div>

        {/* Buttons at bottom */}
        <h2 className="text-gray-500 text-base leading-6 font-semibold pt-4 pb-1">
          Confirm
        </h2>
        <div className="flex flex-row justify-evenly space-x-8 mt-1 mb-2 ">
          <button
            className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
            type="button"
            onClick={handleClickCancel}
          >
            <div className="self-center pr-2 text-gray-500 text-base font-semibold">
              Cancel
            </div>
            <XMarkIcon className="self-center text-gray-500 w-10 my-2 p-1" />
          </button>

          <button
            className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
            value="send"
            type="submit"
          >
            <div className="self-center pr-2 text-gray-500 text-base font-semibold">
              Send
            </div>
            <PaperAirplaneIcon className="self-center text-gray-500 w-10 my-2 p-1" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default WaypointMenuEdit;
