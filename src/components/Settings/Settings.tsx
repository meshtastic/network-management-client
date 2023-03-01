import React, { useState, FormEventHandler } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { Input } from "@material-tailwind/react";

import { selectActiveNode } from "@features/device/deviceSelectors";
import type { User } from "@bindings/protobufs/User";
import { requestUpdateUser } from "@features/device/deviceActions";

// TODO: When moving this to configure nodes, instead of active node, use 'node connected' or 'connected node' or whatever it's called in deviceSelectors

// Function to convert decimal MAC address to hex
function convertMacAddr(macAddr: number[]) {
  let result = macAddr[0].toString(16);

  for (let i = 1; i < macAddr.length; i = i + 1) {
    const item = macAddr[i].toString(16);
    result = result + ":" + item;
  }
  return result.toUpperCase();
}

const Settings = () => {
  // Allows for navigation upon pressing "x"
  const navigateTo = useNavigate();

  // Type: Meshnode. (The currently active one)
  const activeNode = useSelector(selectActiveNode());

  // Functions to set device info. Forbidden non-null suppressed, but I checked if a device is connected.
  const [deviceID, setDeviceID] = useState(
    activeNode?.data.user?.id ?? "No device selected"
  );
  const [deviceName, setDeviceName] = useState(
    activeNode?.data.user?.longName ?? "No device selected"
  );
  const [deviceNickname, setDeviceNickname] = useState(
    activeNode?.data.user?.shortName ?? "No device selected"
  );

  // MAC, Hardware, and Licensing. Even though they are not displayed when null, the check prevents an error on assignment
  const mac = activeNode
    ? convertMacAddr(activeNode.data.user?.macaddr ?? [])
    : "No device selected";
  const hwModel = activeNode?.data.user?.hwModel ?? "No device selected";
  const isLicensed = activeNode?.data.user?.isLicensed ?? "No device selected";

  const dispatch = useDispatch();

  // Submits the form. Triggered by pressing the save button
  const handleSubmit: FormEventHandler = (e) => {
    // e.preventDefault();
    if (activeNode) {
      const updatedUser: User = {
        ...activeNode.data.user!,
        longName: deviceName,
        shortName: deviceNickname,
      };

      dispatch(requestUpdateUser({ user: updatedUser }));
    } else {
      console.log("No active node selected");
    }
  };

  // Render the popup.
  return (
    // Create darker screen
    <div className="drop-shadow font-sans h-screen w-screen bg-black/50 pl-[15%] pt-[3%]">
      {/* Creates light box */}
      <div className="Light-box  rounded-lg w-9/12 h-5/6 bg-gray-100 text-4xl">
        {/* Set up header, close button*/}
        <div className="sticky top-0">
          <div className="flex justify-end sticky top-0">
            <button
              className="X-button flex rounded-md hover:bg-gray-300 w-10 h-10 justify-end"
              onClick={() => {
                navigateTo("/");
              }}
            >
              <XMarkIcon className="justify-center" />
            </button>
          </div>
          <div className="flex justify-center sticky top-0 z-50">
            <div className="font-bold"> Settings </div>
          </div>
        </div>
        <div className="text-sm flex justify-center">
          Note: App will be reloaded on save
        </div>
        {/* Make a form where we put the options */}
        <div className="overflow-y-scroll h-4/5 mt-2">
          <form onSubmit={handleSubmit}>
            <label className="pl-[4%] pl-2 text-xl"> Device ID </label>
            <div className="pl-[6%] pr-[8%] font-sans text-sm">
              <Input
                className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4 disabled:opacity-80"
                type="text"
                size="lg"
                label="Unique preset identifier for this device."
                value={deviceID}
                onChange={(e) => setDeviceID(e.target.value)}
                disabled={true}
              />
            </div>
            <label className="flex pl-[4%] pt-[6%] pl-2 text-xl">
              {" "}
              Device Name{" "}
            </label>
            <div className="pl-[6%] pr-[8%] font-sans text-sm">
              <Input
                className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
                type="text"
                size="lg"
                label="Personalised name for this device."
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                disabled={!activeNode}
              />
            </div>
            <label className="flex pl-[4%] pt-[6%] pl-2 text-xl">
              {" "}
              Device Nickname{" "}
            </label>
            <div className="pl-[6%] pr-[8%] font-sans text-sm">
              <Input
                className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
                type="text"
                size="lg"
                label="3 character nickname for small screens."
                maxLength={3}
                minLength={1}
                value={deviceNickname}
                onChange={(e) => setDeviceNickname(e.target.value)}
                disabled={!activeNode}
              />
            </div>
            {activeNode ? (
              <div>
                <div className="flex pl-[4%] pt-[6%] pl-2 text-base justify-center">
                  Details:
                </div>
                <div className="text-sm pl-[4%]">MAC Address: {mac}</div>
                <div className="text-sm pl-[4%]">Hardware Model: {hwModel}</div>
                <div className="text-sm pl-[4%]">
                  Licensed?: {isLicensed ? "Yes" : "No"}
                </div>
              </div>
            ) : (
              <div></div>
            )}
            <div className="flex justify-center pt-[6%] pb-[3%]">
              <button
                className="border-black border-1 bg-gray-300 px-[6%] py-[2%] text-xl rounded-md hover:bg-gray-400 hover:border-2"
                type="submit"
                disabled={!activeNode}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
