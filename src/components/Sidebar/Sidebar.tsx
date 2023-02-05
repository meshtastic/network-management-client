import React, { useState, useEffect } from "react";
// import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";

import renderTabs from "./RenderTabs";
import {
  overviewGroup,
  networkGroup,
  configGroup,
  settingsGroup,
} from "@components/Sidebar/TabList";

const Sidebar = () => {
  const [isSidebarExpand, setIsSidebarExpand] = useState(true);
  // Icon for expanded sidebar

  return (
    <div className="bg-white text-base flex flex-col overflow-y-auto h-screen">
      <div className="justify-start">
        <div className="px-5 text-xs text-gray-500 font-semibold w-62">
          {isSidebarExpand ? <div>Open :3</div> : <div>Closed uwu</div>}
          <div className="py-2">
            <div>{renderTabs(overviewGroup, isSidebarExpand)}</div>
            <div>{renderTabs(networkGroup, isSidebarExpand)}</div>
            <div>{renderTabs(configGroup, isSidebarExpand)}</div>
            <div>{renderTabs(settingsGroup, isSidebarExpand)}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-self-end ">
        <button
          className="bg-rose-600"
          onClick={() => setIsSidebarExpand(!isSidebarExpand)}
        >
          Change
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
