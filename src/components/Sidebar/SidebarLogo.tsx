import React from "react";
import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";

import "@components/Sidebar/Sidebar.css";

export interface IMeshLogoProps {
  isSidebarExpanded: boolean;
}

const SidebarLogo = ({ isSidebarExpanded }: IMeshLogoProps) => {
  return (
    <div className="flex flex-row justify-start align-middle h-20 p-4 border-b border-gray-100">
      <img
        className="my-auto p-3 bg-gray-700 rounded-lg h-12 w-12"
        src={LogoWhiteSVG}
      />
      <div
        className="sidebar-opacity-transition my-auto pl-4 whitespace-nowrap"
        style={isSidebarExpanded ? { opacity: 1 } : { opacity: 0 }}
      >
        <p className="text-gray-700 text-sm font-medium">Meshtastic</p>
        <p className="text-gray-400 text-xs font-normal">Network Management</p>
      </div>
    </div>
  );
};

export default SidebarLogo;
