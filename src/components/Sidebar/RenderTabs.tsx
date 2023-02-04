import React from "react";
import { ExpandedIcon, CollapsedIcon } from "@components/Sidebar/SidebarIcon";

export interface iconInfo {
  name: string;
  pathname: string;
  icon: JSX.Element;
}

export interface tabGroup {
  title: string;
  tabs: iconInfo[];
}

const renderTabs = (group: tabGroup, isExpand: boolean) => {
  const allButtons = [];
  allButtons.push(isExpand ? group.title.toUpperCase() : "...");
  for (let i = 0; i < group.tabs.length; i = i + 1) {
    allButtons.push(
      isExpand
        ? ExpandedIcon(
            group.tabs[i].name,
            group.tabs[i].pathname,
            group.tabs[i].icon
          )
        : CollapsedIcon(
            group.tabs[i].name,
            group.tabs[i].pathname,
            group.tabs[i].icon
          )
    );
  }

  return <div>{allButtons}</div>;
};

export default renderTabs;
