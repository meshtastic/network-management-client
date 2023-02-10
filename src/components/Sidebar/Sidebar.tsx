import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { MeshSidebarLogo, SidebarIcon } from "@components/Sidebar/SidebarIcon";
import SidebarTab from "@components/Sidebar/SidebarTab";

import {
  MapIcon,
  ChatBubbleBottomCenterTextIcon,
  CircleStackIcon,
  MapPinIcon,
  RadioIcon,
  CubeIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  Cog8ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { AppRoutes } from "@utils/routing";

// Contains Main sidebar component. Called in App.tsx
// This file calls from RenderTabs.tsx to display all of the tabs from Tablist.tsx

const Sidebar = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  const navigateTo = useNavigate();
  const location = useLocation();

  return (
    <div
      className={`flex flex-col h-screen shadow-lg overflow-y-auto ${
        isSidebarExpanded ? "w-[300px] text-gray-500" : "w-20 text-white"
      }`}
    >
      {/* Top icons, including the logo */}
      <MeshSidebarLogo isSidebarExpanded={isSidebarExpanded} />
      <hr />
      <div className="flex flex-col flex-1 justify-between px-5 pt-4">
        <div className="flex flex-col gap-6">
          <SidebarTab title="Overview">
            <SidebarIcon
              name="View Map"
              isActive={location.pathname === AppRoutes.MAP}
              onClick={() => navigateTo(AppRoutes.MAP)}
            >
              <MapIcon />
            </SidebarIcon>

            <SidebarIcon
              name="Messaging"
              isActive={location.pathname === AppRoutes.MESSAGING}
              onClick={() => navigateTo(AppRoutes.MESSAGING)}
            >
              <ChatBubbleBottomCenterTextIcon />
            </SidebarIcon>
          </SidebarTab>

          <SidebarTab title="Network">
            <SidebarIcon
              name="Manage Nodes"
              isActive={location.pathname === AppRoutes.MANAGE_NODES}
              onClick={() => navigateTo(AppRoutes.MANAGE_NODES)}
            >
              <CircleStackIcon />
            </SidebarIcon>

            <SidebarIcon
              name="Manage Waypoints"
              isActive={location.pathname === AppRoutes.MANAGE_WAYPOINTS}
              onClick={() => navigateTo(AppRoutes.MANAGE_WAYPOINTS)}
            >
              <MapPinIcon />
            </SidebarIcon>
          </SidebarTab>

          <SidebarTab title="Configuration">
            <SidebarIcon
              name="Configure Radio"
              isActive={location.pathname === AppRoutes.CONFIGURE_RADIO}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_RADIO)}
            >
              <RadioIcon />
            </SidebarIcon>

            <SidebarIcon
              name="Configure Plugins"
              isActive={location.pathname === AppRoutes.CONFIGURE_PLUGINS}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_PLUGINS)}
            >
              <CubeIcon />
            </SidebarIcon>

            <SidebarIcon
              name="Configure Channels"
              isActive={location.pathname === AppRoutes.CONFIGURE_CHANNELS}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_CHANNELS)}
            >
              <EnvelopeIcon />
            </SidebarIcon>
          </SidebarTab>
        </div>

        {/* Bottom icons */}
        <div className="space-y-2 ">
          <SidebarTab title="Settings">
            <SidebarIcon
              name="Export Data"
              isActive={location.pathname === AppRoutes.EXPORT_APP_DATA}
              onClick={() => navigateTo(AppRoutes.EXPORT_APP_DATA)}
            >
              <DocumentArrowDownIcon />
            </SidebarIcon>

            <SidebarIcon
              name="Application Settings"
              isActive={location.pathname === AppRoutes.APPLICATION_SETTINGS}
              onClick={() => navigateTo(AppRoutes.APPLICATION_SETTINGS)}
            >
              <Cog8ToothIcon />
            </SidebarIcon>
          </SidebarTab>

          <hr />

          <SidebarIcon
            name="Collapse Sidebar"
            isActive={false}
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
          >
            {isSidebarExpanded ? (
              <ChevronDoubleLeftIcon />
            ) : (
              <ChevronDoubleRightIcon />
            )}
          </SidebarIcon>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
