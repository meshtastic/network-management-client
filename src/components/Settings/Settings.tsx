import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Input } from "@material-tailwind/react";

function Settings() {
  return (
    <div className="Settings-popup bg-black bg-opacity-60 z-20">
      <div className="Settings-inner rounded-md drop-shadow z-40">
        <div className="Settings-text font-sans text-4xl">Settings </div>
        <div className="Option1">
          <p className="Settings-text font-sans text-2xl">Option1</p>
          {/* <div className="flex w-full items-end gap-4 sm:w-80">
            <Input size="lg" />
          </div> */}
        </div>
        <button className="Close-button ">
          <XMarkIcon className="rounded-md hover:bg-gray-300 w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

export default Settings;
