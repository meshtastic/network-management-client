import React from "react";
import type { ReactNode } from "react";

// This file contains:
// 1. Interfaces for individual tabs, and for groups of tabs. These are called in TabList.tsx for easier understanding.
// 2. Function to render a whole tabGroup. This is called in the main Sidebar.tsx, once for each group

//
export interface iconInfo {
  name: string;
  pathname: string;
  icon: JSX.Element;
}

export interface tabGroup {
  title: string;
  tabs: iconInfo[];
}

export interface ISidebarTabProps {
  title: string;
  children: ReactNode;
}

const SidebarTab = ({ title, children }: ISidebarTabProps) => {
  return (
    <div>
      <p className="mb-2 text-[9px] text-gray-500 uppercase font-semibold">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
};

export default SidebarTab;
