import React, { useState, useEffect } from "react";
import {
  // Overview
  MapIcon,
  ChatBubbleBottomCenterTextIcon,

  // Network
  CircleStackIcon,
  MapPinIcon,

  // Config
  RadioIcon,
  CubeIcon,
  EnvelopeIcon,

  // Settings
  DocumentArrowDownIcon,
  Cog8ToothIcon,
  ArrowLeftOnRectangleIcon,

  // Alt Collapse
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,

  // Testing
  BeakerIcon,
} from "@heroicons/react/24/outline";

import { ExpandedIcon, CollapsedIcon } from "@components/Sidebar/SidebarIcon";
// import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";

import renderTabs from "./RenderTabs";
import {
  overviewGroup,
  networkGroup,
  configGroup,
  settingsGroup,
} from "@components/Sidebar/TabList";

// TODO:
// 1. Sidebar should be overlaid instead of on the Side; on opening, it should not scrunch the map over
//    On this point; there's something wrong with messaging. I'm guessing it's because Message flex is overwriting the sidebar size somehow? But
//    If we make this floating then the messaging shouldn't bother it.
//    In this vein; where did we add the sidebar in? The reason it's doing this is because of clearly defined sizes in Settings.
// 3. Propose new buttons
// 5. Clean, clear documentation
// 6. Remove the #messaging and #settings from main menu

const Sidebar = () => {
  const [isSidebarExpand, setIsSidebarExpand] = useState(true);
  // Icon for expanded sidebar

  return (
    <div className="bg-white text-base flex flex-col overflow-y-auto h-screen">
      <div className="justify-start">
        {isSidebarExpand ? (
          <div className="px-5 text-xs text-gray-500 font-semibold w-62">
            OPEN
            <div className="py-2">
              <div>{renderTabs(overviewGroup, isSidebarExpand)}</div>
              <div>{renderTabs(networkGroup, isSidebarExpand)}</div>
              <div>{renderTabs(configGroup, isSidebarExpand)}</div>
              <div>{renderTabs(settingsGroup, isSidebarExpand)}</div>
            </div>
          </div>
        ) : (
          // If isSidebarExpand is False
          <div className="px-5 text-xs text-gray-500 font-semibold w-62">
            Closed
            <div className="py-2">
              <div>{renderTabs(overviewGroup, isSidebarExpand)}</div>
              <div>{renderTabs(networkGroup, isSidebarExpand)}</div>
              <div>{renderTabs(configGroup, isSidebarExpand)}</div>
              <div>{renderTabs(settingsGroup, isSidebarExpand)}</div>
            </div>
          </div>
        )}
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
