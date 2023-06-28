import React, { useState, FormEventHandler } from "react";
import { useSelector, useDispatch } from "react-redux";

import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

import type { app_protobufs_Waypoint } from "@bindings/index";

import ConnectionInput from "@components/connection/ConnectionInput";

import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestSendWaypoint } from "@features/device/deviceActions";
import {
  selectPrimaryDeviceKey,
  selectPlaceholderWaypoint,
  selectDeviceChannels,
} from "@features/device/deviceSelectors";

import { getChannelName } from "@utils/messaging";

// This component contains the Waypoint Menu when it is not being edited
// It is called in MapView.tsx

const WaypointMenuEdit = () => {
  const dispatch = useDispatch();
  const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());
  const deviceChannels = useSelector(selectDeviceChannels());

  const placeholderWaypoint = useSelector(selectPlaceholderWaypoint());
  const waypoint = placeholderWaypoint;

  // Waypoint info
  const [waypointName, setWaypointName] = useState(waypoint?.name || "");
  const [waypointDescription, setWaypointDescription] = useState(
    waypoint?.description || ""
  );

  const [channelNum, setChannelNum] = useState(0);

  const waypointLat = waypoint?.latitudeI ? waypoint.latitudeI / 1e7 : null;
  const waypointLong = waypoint?.longitudeI ? waypoint.longitudeI / 1e7 : null;

  if (!waypoint || !waypointLat || !waypointLong) return null;

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (!primaryDeviceKey) {
      console.warn("No primary device key port, not updating waypoint");
      return;
    }

    const updatedWaypoint: app_protobufs_Waypoint = {
      ...waypoint,
      id: 0,
      name: waypointName,
      description: waypointDescription,
      // TODO there has to be a better way to drop decimals
      latitudeI: parseInt((waypointLat * 1e7).toString()),
      longitudeI: parseInt((waypointLong * 1e7).toString()),
    };

    dispatch(
      requestSendWaypoint({
        deviceKey: primaryDeviceKey,
        waypoint: updatedWaypoint,
        channel: channelNum,
      })
    );
    dispatch(deviceSliceActions.setInfoPane("waypoint"));
  };

  const handleCancel = () => {
    dispatch(deviceSliceActions.setInfoPane(null));
    dispatch(deviceSliceActions.setActiveWaypoint(null));
    dispatch(deviceSliceActions.setPlaceholderWaypoint(null));
  };

  return (
    <div className="absolute top-24 right-9 bg-white py-3 pr-5 pl-4 rounded-lg drop-shadow-lg w-80">
      <form onSubmit={handleSubmit}>
        {/* Title, X-button */}
        <div className="flex justify-between">
          <h1 className="text-gray-500 text-base leading-6 font-semibold pt-2 ">
            Title
          </h1>
          <button type="button" onClick={handleCancel}>
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Title */}
        <ConnectionInput
          type="text"
          value={waypointName}
          placeholder="Waypoint title"
          onChange={(e) => setWaypointName(e.target.value)}
        />

        {/* Description */}
        <h2 className="text-gray-500 text-base leading-6 font-semibold pt-2">
          Description
        </h2>

        <ConnectionInput
          type="text"
          value={waypointDescription}
          placeholder="Waypoint description"
          onChange={(e) => setWaypointDescription(e.target.value)}
        />

        <h2 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
          Location
        </h2>

        <div className="flex flex-col">
          <div className="flex justify-between pb-1">
            <div className="flex justify-start">
              <h2 className="text-gray-500 text-base leading-5 font-normal ">
                {waypointLat == null || waypointLong == null
                  ? "No location data"
                  : `${waypointLat.toFixed(5)}° lat, ${waypointLong.toFixed(
                      5
                    )}° long`}
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
            className="self-center bg-gray-100 p-2 w-11/12 rounded-md items-center text-gray-500 text-base font-normal "
            value={channelNum}
            onChange={(e) => setChannelNum(parseInt(e.target.value))}
          >
            {deviceChannels
              .filter((c) => c.config.role !== 0) // Filter disabled channels
              .map((channel) => (
                <option key={channel.config.index} value={channel.config.index}>
                  {getChannelName(channel)}
                </option>
              ))}
          </select>
        </div>

        <h2 className="text-gray-500 text-base leading-6 font-semibold pt-4 pb-1">
          Confirm
        </h2>

        <div className="flex flex-row justify-evenly space-x-8 mt-1 mb-2 ">
          <button
            className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
            type="button"
            onClick={handleCancel}
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
