import React, { useState } from "react";

import renderTabs from "./RenderTabs";
import {
  overviewGroup,
  networkGroup,
  configGroup,
  settingsGroup,
} from "@components/Sidebar/TabList";
import { ChangeSidebarIcon, MeshLogo } from "./SidebarIcon";

// Contains Main sidebar component. Called in App.tsx
// This file calls from RenderTabs.tsx to display all of the tabs from Tablist.tsx

const Sidebar = () => {
  const [isSidebarExpand, setIsSidebarExpand] = useState(true);

  return (
    <div
      className={`text-base overflow-y-auto h-screen flex flex-col font-semibold shrink-0 shadow-md ${
        isSidebarExpand ? "w-72 text-gray-500" : "w-30 text-white"
      }`}
    >
      {/* Top icons, including the logo */}
      {MeshLogo(isSidebarExpand)}
      <div className="px-5">
        <div className="text-xs h-full space-y-4">
          <hr />
          <div>{renderTabs(overviewGroup, isSidebarExpand)}</div>
          <div>{renderTabs(networkGroup, isSidebarExpand)}</div>
          <div>{renderTabs(configGroup, isSidebarExpand)}</div>
        </div>

        {/* Bottom icons */}
        <div className="text-xs space-y-2 ">
          <div>{renderTabs(settingsGroup, isSidebarExpand)}</div>
          <hr />
          <button
            className="w-full"
            onClick={() => setIsSidebarExpand(!isSidebarExpand)}
          >
            {ChangeSidebarIcon(isSidebarExpand)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
