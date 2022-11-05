import React, { useState } from "react";
import "./Settings.css";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Input } from "@material-tailwind/react";

function Settings(props) {
  return props.trigger ? (
    <div className="Settings-popup">
      <div className="Settings-inner">
        <div className="Settings-text font-sans text-5xl">Settings </div>
        <div className="Option1">
          <p className="Settings-text font-sans text-2xl"> Option1 </p>
          <div className="flex w-full items-end gap-4 sm:w-80">
            <Input size="lg" />
          </div>
        </div>
        <div className="Option2">
          <p className="Settings-text font-sans text-2xl"> Option2 </p>
        </div>
        <div className="Option3">
          <p className="Settings-text font-sans text-2xl"> Option3 </p>
        </div>
        <button className="Close-button">
          <XMarkIcon className="text-grey-500 h-6 w-6" />
        </button>
        {props.children}
      </div>
    </div>
  ) : (
    ""
  );
}

export default Settings;
