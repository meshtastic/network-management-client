import React, { useState, useEffect } from "react";
// import { Provider, connect, useSelector, useDispatch } from "react-redux";

import { ExpandedIcon } from "@components/Sidebar/SidebarOpen";
import SidebarCollapsed from "@components/Sidebar/SidebarCollapsed";
import tabList, { tabGroup } from "@components/Sidebar/TabList";

// import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";

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

// TODO:
// 1. Sidebar should be overlaid instead of on the Side; on opening, it should not scrunch the map over
//    On this point; there's something wrong with messaging. I'm guessing it's because Message flex is overwriting the sidebar size somehow? But
//    If we make this floating then the messaging shouldn't bother it.
// 2. Add in an overflow because the sidebar very long
// 3. Propose new buttons
// 5. Clean, clear documentation

const Sidebar = () => {
  const [isSidebarExpand, setIsSidebarExpand] = useState(true);

  return (
    // Flex col tells it that we want them aligned vertically
    <div className="bg-white text-base flex flex-col overflow-y-auto h-screen">
      <div className="justify-start">
        {isSidebarExpand ? (
          <div>
            <div className="px-3 text-xs text-gray-500 font-semibold pr-2 w-62">
              OPEN
              <div className="py-2">
                <div>
                  OVERVIEW
                  {ExpandedIcon("View Map", "/", <MapIcon />)}
                  {ExpandedIcon(
                    "Messaging",
                    "/messaging",
                    <ChatBubbleBottomCenterTextIcon />
                  )}
                </div>
                <div>
                  NETWORK
                  {ExpandedIcon("Manage Nodes", "/TODO", <CircleStackIcon />)}
                  {ExpandedIcon("Manage Waypoints", "/TODO", <MapPinIcon />)}
                </div>
                <div>
                  CONFIGURATION
                  {ExpandedIcon(
                    "Radio Configuration",
                    "/serial-connect",
                    <RadioIcon />
                  )}
                  {ExpandedIcon("Plugin Configuration", "/TODO", <CubeIcon />)}
                  {ExpandedIcon(
                    "Channel Configuration",
                    "/TODO",
                    <EnvelopeIcon />
                  )}
                </div>
                <div>
                  SETTINGS
                  {ExpandedIcon(
                    "Export Data",
                    "/TODO",
                    <DocumentArrowDownIcon />
                  )}
                  {ExpandedIcon(
                    "Application Settings",
                    "/#settings",
                    <Cog8ToothIcon />
                  )}
                  {ExpandedIcon(
                    "Collapse Sidebar",
                    "/TODO",
                    <ArrowLeftOnRectangleIcon />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>hi</div>
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
