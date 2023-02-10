import React from "react";
import type { ReactNode } from "react";

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

export interface ISidebarIconProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}

const SidebarIcon = ({
  name,
  isActive,
  onClick,
  children,
}: ISidebarIconProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick()}
      className={`flex flex-row align-middle w-full rounded-lg
        ${isActive ? "bg-gray-700" : "bg-white"} `}
    >
      {/* Sets entire horizontal area as tab */}
      <div className="flex flex-row w-full p-3">
        {/* Display the icon */}
        <div
          className={`w-6 h-6 ${isActive ? "text-gray-200" : "text-gray-400"}`}
        >
          {children}
        </div>

        {/* Display the name of the tab */}
        <p
          className={`px-2 text-xs font-semibold self-center whitespace-nowrap 
            ${isActive ? "text-gray-100" : "text-gray-600"}
            `}
        >
          {name}
        </p>
      </div>
    </button>
  );
};

export interface IMeshLogoProps {
  isSidebarExpanded: boolean;
}

const MeshSidebarLogo = ({ isSidebarExpanded }: IMeshLogoProps) => {
  if (isSidebarExpanded) {
    return (
      <div className="flex flex-row align-middle h-20 px-5">
        <img
          className="my-auto p-3 bg-gray-700 rounded-lg h-12 w-12"
          src={LogoWhiteSVG}
        />
        <div className="self-center pl-4">
          <p className="text-gray-700 text-sm font-medium">Meshtastic</p>
          <p className="text-gray-400 text-xs font-normal">
            Emergency Response
          </p>
        </div>
      </div>
    );
  }

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
};

export { SidebarIcon, MeshSidebarLogo };
