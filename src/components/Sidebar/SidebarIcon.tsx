import DefaultTooltip from "@components/DefaultTooltip";
import type { ReactNode } from "react";

import "@components/Sidebar/Sidebar.css";

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
    <DefaultTooltip text={name} deactivated={isSidebarExpanded} side="right">
      <button
        type="button"
        onClick={onClick}
        className={`sidebar-background-color-transition flex flex-row align-middle w-full rounded-lg
        ${
          isActive
            ? "bg-gray-700 dark:bg-gray-300"
            : "bg-white dark:bg-gray-800"
        } `}
      >
        <div className="flex flex-row w-full p-3">
          <div
            className={`w-6 h-6 ${
              isActive
                ? "text-gray-200 dark:text-gray-700"
                : "text-gray-400 dark:text-gray-400"
            }`}
          >
            {children}
          </div>

          <p
            className={`sidebar-opacity-transition px-3 text-xs font-medium self-center whitespace-nowrap 
            ${
              isActive
                ? "text-gray-100 dark:text-gray-700"
                : "text-gray-700 dark:text-gray-300"
            }
            `}
            style={isSidebarExpanded ? { opacity: 1 } : { opacity: 0 }}
          >
            {name}
          </p>
        </div>
      </button>
    </DefaultTooltip>
  );
};

export default SidebarIcon;
