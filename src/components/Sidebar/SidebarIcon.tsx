import React from "react";
import type { ReactNode } from "react";

import "@components/Sidebar/Sidebar.css";
import DefaultTooltip from "../DefaultTooltip";

export interface ISidebarIconProps {
  name: string;
  isActive: boolean;
  isSidebarExpanded: boolean;
  onClick: () => void;
  children: ReactNode;
}

const SidebarIcon = ({
  name,
  isActive,
  isSidebarExpanded,
  onClick,
  children,
}: ISidebarIconProps) => {
  return (
    <>
      <DefaultTooltip text={name} deactivated={isSidebarExpanded} side="right">
        <button
          type="button"
          onClick={() => onClick()}
          className={`sidebar-background-color-transition flex flex-row align-middle w-full rounded-lg
        ${isActive ? "bg-gray-700" : "bg-white"} `}
        >
          <div className="flex flex-row w-full p-3">
            <div
              className={`w-6 h-6 ${
                isActive ? "text-gray-200" : "text-gray-400"
              }`}
            >
              {children}
            </div>

            <p
              className={`sidebar-opacity-transition px-3 text-xs font-medium self-center whitespace-nowrap 
            ${isActive ? "text-gray-100" : "text-gray-700"}
            `}
              style={isSidebarExpanded ? { opacity: 1 } : { opacity: 0 }}
            >
              {name}
            </p>
          </div>
        </button>
      </DefaultTooltip>
    </>
  );
};

export default SidebarIcon;
