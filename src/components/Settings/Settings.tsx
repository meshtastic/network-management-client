import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Input } from "@material-tailwind/react";
import "./Settings.css";

function Settings() {
  return (
    // Create darker screen
    <div className="Dark-screen drop-shadow font-sans h-screen bg-black/50 z-50">
      {/* Creates light box */}
      <div className="Light-box overflow-y-scroll rounded-lg w-9/12 h-5/6 bg-gray-100 text-4xl ">
        {/* Set up header, close */}
        <div className="flex justify-center">
          <div className="font-bold"> Settings </div>
          {/* <button className="X-button flex rounded-md hover:bg-gray-300 w-8 h-8 object-right self-center">
            <XMarkIcon className="self-center" />
          </button> */}
        </div>
        {/* Set different options */}
        <div className="pl-[2%] pt-[3%] pl-2 text-xl"> Option </div>
        <div className="pl-[5%] pr-[10%] font-sans text-2xl">
          <Input
            className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
            size="lg"
          />
        </div>
        {/*  */}
        <div className="pl-[2%] pt-[3%] pl-2 text-xl"> Option </div>
        <div className="pl-[5%] pr-[10%] font-sans text-2xl">
          <Input
            className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
            size="lg"
          />
        </div>
        <div className="pl-[2%] pt-[3%] pl-2 text-xl"> Option </div>
        <div className="pl-[5%] pr-[10%] font-sans text-2xl">
          <Input
            className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
            size="lg"
          />
        </div>
        <div className="pl-[2%] pt-[3%] pl-2 text-xl"> Option </div>
        <div className="pl-[5%] pr-[10%] font-sans text-2xl">
          <Input
            className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
            size="lg"
          />
        </div>
        <div className="pl-[2%] pt-[3%] pl-2 text-xl"> Option </div>
        <div className="pl-[5%] pr-[10%] font-sans text-2xl">
          <Input
            className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
            size="lg"
          />
        </div>
        <div className="pl-[2%] pt-[3%] pl-2 text-xl"> Option </div>
        <div className="pl-[5%] pr-[10%] font-sans text-2xl">
          <Input
            className="rounded-lg bg-gray-300 hover:bg-gray-200 p-4"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
