import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";
import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";
// import LogoBlackSVG from "@app/assets/Mesh_Logo_Black.png";

// This file contains four icons:
//
// 1. Expanded form of each tab
// 2. Collapsed form of each tab
// 3. The icon for expanding/collapsing the sidebar
// 4. The Meshtastic+ logo in both expanded and collapsed forms.
//
// The first two are called by RenderTabs.tsx to make the tab groups;
// The latter two are called directly in the main Sidebar.tsx component.

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
            className={`px-2 self-center whitespace-nowrap 
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

const ChangeSidebarIcon = (isExpand: boolean) => {
  // Icon for expanding/collapsing the sidebar

  const icon = isExpand ? (
    <ChevronDoubleLeftIcon />
  ) : (
    <ChevronDoubleRightIcon />
  );

  return (
    <div className="flex flex-row font-semibold text-base px-2 py-3">
      <div className="px-1 w-9 text-gray-400">{icon}</div>
      {isExpand ? (
        <div className="px-2 self-center text-gray-600">CoIIapse Sidebar</div>
      ) : (
        <div />
      )}
    </div>
  );
};

const MeshLogo = (isSidebarExpanded: boolean) => {
  // Logo at top of sidebar.

  if (isSidebarExpanded) {
    return (
      <div className="p-5 pr-3 flex flex-row">
        <div>
          <img
            className="bg-gray-700 p-3 rounded-lg h-20 w-20"
            src={LogoWhiteSVG}
          />
        </div>
        <div className="self-center pl-4 pb-1 ">
          <p className="text-gray-700 text-lg">Meshtastic</p>
          <p className="text-gray-400 text-base">Emergency Response</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="py-5 flex flex-row self-center">
        <div className="h-20 ">
          {/* Logo as according to design spec. It might be confused for a button; needs discussion */}
          <img
            className="bg-gray-700 p-3 rounded-lg h-20 w-20"
            src={LogoWhiteSVG}
          />

          {/* Potential darker colored logo */}
          {/* <img
            className="bg-white px-3 py-6 rounded-lg w-20"
            src={LogoBlackSVG}
          /> */}
        </div>
      </div>
    );
  }
};

export { ChangeSidebarIcon, ExpandedIcon, CollapsedIcon, MeshLogo };
