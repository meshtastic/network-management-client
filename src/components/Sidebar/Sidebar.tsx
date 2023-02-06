import React, { useState } from "react";
// import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";

import renderTabs from "./RenderTabs";
import {
  overviewGroup,
  networkGroup,
  configGroup,
  settingsGroup,
} from "@components/Sidebar/TabList";

import { ChangeSidebarIcon } from "./SidebarIcon";

// // # TODO Next:
// 1. Add in Mesh logo at top

// TODO after doing all of this:
// 5. Do everything from the readme

const Sidebar = () => {
  // Main sidebar component

  // Boolean
  const [isSidebarExpand, setIsSidebarExpand] = useState(true);

  return (
    <div
      className={`py-5 px-5  bg-emerald-200 text-base overflow-y-auto h-screen flex flex-col font-semibold z-50 ${
        isSidebarExpand ? "w-80 text-gray-500" : "w-30 text-white"
      }`}
    >
      <div className="text-xs h-full space-y-4 ">
        {isSidebarExpand ? <div>Open :3</div> : <div>Closed</div>}
        <div>{renderTabs(overviewGroup, isSidebarExpand)}</div>
        <div>{renderTabs(networkGroup, isSidebarExpand)}</div>
        <div>{renderTabs(configGroup, isSidebarExpand)}</div>
      </div>
      <div className="text-xs ">
        <div>{renderTabs(settingsGroup, isSidebarExpand)}</div>
        <button
          className="w-full"
          onClick={() => setIsSidebarExpand(!isSidebarExpand)}
        >
          {ChangeSidebarIcon(isSidebarExpand)}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
