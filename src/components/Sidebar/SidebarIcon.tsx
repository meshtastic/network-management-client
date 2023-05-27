import React from "react";
import { ReactNode, forwardRef } from "react";

import "@components/Sidebar/Sidebar.css";

export interface ISidebarIconProps {
  name: string;
  isActive: boolean;
  isSidebarExpanded: boolean;
  onClick: () => void;
  children: ReactNode;
}

const SidebarIcon = forwardRef<HTMLButtonElement, ISidebarIconProps>(
  function SidebarIcon(props, ref) {
    const { name, isActive, isSidebarExpanded, onClick, children } = props;

    return (
      <button
        {...props}
        type="button"
        onClick={() => onClick()}
        className={`sidebar-background-color-transition flex flex-row align-middle w-full rounded-lg
        ${isActive ? "bg-gray-700" : "bg-white"} `}
        ref={ref}
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
    );
  }
);
export default SidebarIcon;
