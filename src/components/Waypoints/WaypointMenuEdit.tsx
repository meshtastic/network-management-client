import React, { useState, FormEventHandler } from "react";

import { deviceSliceActions } from "@features/device/deviceSlice";

import { useSelector, useDispatch } from "react-redux";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

import { requestNewWaypoint } from "@features/device/deviceActions";
import { Input } from "@material-tailwind/react";

import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

import { selectActiveWaypoint } from "@app/features/device/deviceSelectors";

const WaypointMenu = () => {
  const dispatch = useDispatch();
  const activeWaypoint = useSelector(selectActiveWaypoint());
  const waypointLat = activeWaypoint?.latitudeI
    ? (activeWaypoint.latitudeI / 1e7).toString()
    : null;
  const waypointLong = activeWaypoint?.longitudeI
    ? (activeWaypoint.longitudeI / 1e7).toString()
    : null;

  const [waypointTitle, setWaypointTitle] = useState(activeWaypoint?.name);
  const [waypointDescription, setWaypointDescription] = useState(
    activeWaypoint?.description
  );

  const handleClick: FormEventHandler = (e) => {
    console.log("Canceled Edit Waypoint");
    dispatch(deviceSliceActions.setWaypointEdit(false));
  };

  const handleSubmit: FormEventHandler = (e) => {
    console.log(
      (document.getElementById("channel") as HTMLInputElement).value ?? 0
    );

    e.preventDefault();
    console.log("Clicked send");

    if (activeWaypoint) {
      const updatedWaypoint: Waypoint = {
        ...activeWaypoint,
        name: waypointTitle ? waypointTitle : "",
        description: waypointDescription ? waypointDescription : "",
      };
      dispatch(requestNewWaypoint({ waypoint: updatedWaypoint, channel: 0 }));
      dispatch(deviceSliceActions.setWaypointEdit(false));
    } else {
      console.log("Error: No active waypoint");
    }
  };

  if (!activeWaypoint) {
    return <></>;
  } else {
    return (
      <div className="absolute top-24 right-9 bg-white pt-5 pr-5 pb-3 pl-4 rounded-lg drop-shadow-lg w-80">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between">
            <h4 className="text-gray-500 text-base leading-6 font-semibold pt-2 ">
              Title
            </h4>
            <div className=""></div>
            <div>
              <button
                type="button"
                onClick={() =>
                  dispatch(deviceSliceActions.setActiveWaypoint(null))
                }
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <h1 className="text-gray-600 text-2xl leading-5 font-semibold ">
            <Input
              className="rounded-md bg-gray-100 p-4 w-11/12"
              type="text"
              size="lg"
              value={!waypointTitle ? "No Title" : waypointTitle}
              onChange={(e) => setWaypointTitle(e.target.value)}
              disabled={false}
            />
          </h1>
          <h4 className="text-gray-500 text-base leading-6 font-semibold pt-2">
            Description
          </h4>
          <h3 className="text-gray-500 text-base leading-5 font-normal py-1">
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
          </h3>

          <h4 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
            Location
          </h4>
          {/* ////////////////////////////////////////////////////////// */}
          <div className="flex flex-col">
            <div className="flex justify-between pb-1">
              <div className="flex justify-start">
                <h3 className="text-gray-500 text-base leading-5 font-normal ">
                  {waypointLat == null || waypointLong == null
                    ? "No location data"
                    : "(" + waypointLat + ", " + waypointLong + ")"}
                </h3>
              </div>
            </div>
            {/* /////////////////////////////// */}

            <hr className="my-2" />
          </div>
          <h4 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
            Channel
          </h4>

          <div className=" ">
            <select
              id="channel"
              className="self-center bg-gray-100 rounded-md bg-gray-100 p-2 w-11/12 rounded-md items-center text-gray-500 text-base font-normal "
            >
              <option value="0">Channel 0</option>
              <option value="1">Channel 1</option>
              <option value="2">Channel 2</option>
            </select>
          </div>

          <h4 className="text-gray-500 text-base leading-6 font-semibold pt-2 pb-1">
            Confirm
          </h4>

          <div className="flex flex-row justify-evenly space-x-8 mt-3 mb-2 ">
            <button
              className="flex flex-row border-2 rounded-md border-gray-200 h-8 px-3 py-5 hover:drop-shadow-lg"
              type="button"
              onClick={handleClick}
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
              {" "}
              <div className="self-center pr-2 text-gray-500 text-base font-semibold">
                Send
              </div>
              <PaperAirplaneIcon className="self-center text-gray-500 w-10 my-2 p-1" />
            </button>
          </div>
        </form>
      </div>
    );
  }
};

export default WaypointMenu;
