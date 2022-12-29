import React from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Input } from "@material-tailwind/react";

function Settings() {
  const navigateTo = useNavigate();

  return (
    // Create darker screen
    <div className="drop-shadow font-sans h-screen bg-black/50 z-50 pl-[15%] pt-[3%]">
      {/* Creates light box */}
      <div className="Light-box  rounded-lg w-9/12 h-5/6 bg-gray-100 text-4xl">
        {/* Set up header, close button*/}
        <div className="sticky top-0">
          <div className="flex justify-end sticky top-0">
            <button
              className="X-button flex rounded-md hover:bg-gray-300 w-8 h-8 justify-end"
              onClick={() => navigateTo("/")}
            >
              <XMarkIcon />
            </button>
          </div>
          <div className="flex justify-center sticky top-0 z-50">
            <div className="font-bold"> Settings </div>
          </div>
        </div>
        {/* Set different options */}
        <div className="overflow-y-scroll h-4/5 mt-2">
          <div className="pl-[4%] pl-2 text-xl"> Option </div>
          <div className="pl-[6%] pr-[8%] font-sans text-2xl">
            <Input
              className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
              size="lg"
            />
          </div>
          <div className="pl-[4%] pt-[3%] pl-2 text-xl"> Option </div>
          <div className="pl-[6%] pr-[8%] font-sans text-2xl">
            <Input
              className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
              size="lg"
            />
          </div>
          <div className="pl-[4%] pt-[3%] pl-2 text-xl"> Option </div>
          <div className="pl-[6%] pr-[8%] font-sans text-2xl">
            <Input
              className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
              size="lg"
            />
          </div>
          <div className="pl-[4%] pt-[3%] pl-2 text-xl"> Option </div>
          <div className="pl-[6%] pr-[8%] font-sans text-2xl">
            <Input
              className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
              size="lg"
            />
          </div>
          <div className="pl-[4%] pt-[3%] pl-2 text-xl"> Option </div>
          <div className="pl-[6%] pr-[8%] font-sans text-2xl">
            <Input
              className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
              size="lg"
            />
          </div>
          <div className="pl-[4%] pt-[3%] pl-2 text-xl"> Option </div>
          <div className="pl-[6%] pr-[8%] font-sans text-2xl">
            <Input
              className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
