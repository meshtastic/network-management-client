import React from "react";
import type { ReactNode } from "react";

import "@components/Sidebar/Sidebar.css";

export interface ISidebarTabProps {
  title: string;
  isSidebarExpanded: boolean;
  children: ReactNode;
}

const SidebarTab = ({
  title,
  isSidebarExpanded,
  children,
}: ISidebarTabProps) => {
  return (
    <div>
      <p
        className="sidebar-opacity-transition mb-2 text-[9px] text-gray-500 uppercase font-semibold"
        style={isSidebarExpanded ? { opacity: 1 } : { opacity: 0 }}
      >
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
};

export default SidebarTab;
