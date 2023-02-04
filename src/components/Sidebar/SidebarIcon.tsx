import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// This file contains the code for each individual tab in the sidebar.
// There are two forms: one for each of when the sidebar is expanded and collapsed.
// Both forms take in 3 props:
//    1. The name of the tab
//    2. The path name for the tab
//    3. The SVG icon for the tab
//

const ExpandedIcon = (name: string, pathname: string, icon: JSX.Element) => {
  // Icon for expanded sidebar

  const navigateTo = useNavigate();
  const isActive = useLocation().pathname === pathname;

  return (
    <div className="">
      {/* Controls background color when clicked */}
      <div
        className={`px-2 flex flex-none rounded-lg font-semibold text-base
        ${isActive ? "bg-gray-700" : "bg-white"} `}
      >
        {/* Sets entire horizontal area as tab */}
        <button
          className="flex flex-row w-full py-3"
          onClick={() => navigateTo(pathname)}
        >
          {/* Display the icon */}
          <div
            className={`px-1 w-9 ${
              isActive ? "text-gray-200" : "text-gray-400"
            }`}
          >
            {icon}
          </div>

          {/* Display the name of the tab */}
          <div
            className={`px-2 self-center
            ${isActive ? "text-gray-100" : "text-gray-600"}
            `}
          >
            {name}
          </div>
        </button>
      </div>
    </div>
  );
};

const CollapsedIcon = (name: string, pathname: string, icon: JSX.Element) => {
  // Icon for collapsed sidebar

  const navigateTo = useNavigate();
  const isActive = useLocation().pathname === pathname;

  return (
    <div className="">
      {/* Controls background color when clicked */}
      <div
        className={`px-2 flex flex-none rounded-lg font-semibold text-base
        ${isActive ? "bg-gray-700" : "bg-white"} `}
      >
        {/* Sets entire horizontal area as tab */}
        <button
          className="flex flex-row w-full py-3"
          onClick={() => navigateTo(pathname)}
        >
          {/* Display the icon */}
          <div
            className={`px-1 w-9 ${
              isActive ? "text-gray-200" : "text-gray-400"
            }`}
          >
            {icon}
          </div>
        </button>
      </div>
    </div>
  );
};

export { ExpandedIcon };
export { CollapsedIcon };
