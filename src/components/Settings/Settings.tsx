import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Input } from "@material-tailwind/react";

const Settings = () => {
  const navigateTo = useNavigate();

  const [deviceID, setDeviceID] = useState("Default Device ID");
  const [deviceName, setDeviceName] = useState("Mr. Meshtastic");
  const [deviceNickname, setDeviceNickname] = useState("MRM");

  const handleSubmit = (e) => {
    e.preventDefault();
    const deviceInfoTest = { deviceID, deviceNickname, deviceName };
    console.log(deviceInfoTest);
  };

  return (
    // Create darker screen
    <div className="drop-shadow font-sans h-screen bg-black/50 z-50 pl-[15%] pt-[3%]">
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
          Note: This is the UI, and is not currently connected to backend
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
                disabled
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
              />
            </div>
            <label className="flex pl-[4%] pt-[6%] pl-2 text-xl">
              {" "}
              Option 4{" "}
            </label>{" "}
            <div className="pl-[6%] pr-[8%] font-sans text-sm">
              <Input
                className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
                type="text"
                size="lg"
                label="Placeholder for adding future functionality"
              />
            </div>
            <div className="flex justify-center pt-[6%] pb-[3%]">
              <button
                className="border-black border-1 bg-gray-300 px-[6%] py-[2%] text-xl rounded-md hover:bg-gray-400 hover:border-2"
                type="submit"
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
