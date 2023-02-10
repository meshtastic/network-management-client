import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

import SidebarIcon from "@components/Sidebar/SidebarIcon";
import SidebarLogo from "@components/Sidebar/SidebarLogo";
import SidebarTab from "@components/Sidebar/SidebarTab";
import { AppRoutes } from "@utils/routing";

import "@components/Sidebar/Sidebar.css";

const Sidebar = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  const navigateTo = useNavigate();
  const location = useLocation();

  return (
    <div
      className={`sidebar-width-transition flex flex-col h-screen shadow-lg overflow-y-auto ${
        isSidebarExpanded ? "w-[300px] text-gray-500" : "w-20 text-white"
      }`}
    >
      <SidebarLogo isSidebarExpanded={isSidebarExpanded} />

      <div className="flex flex-col flex-1 justify-between px-4 pt-4 pb-1">
        <div className="flex flex-col gap-6 mb-6">
          <SidebarTab title="Overview" isSidebarExpanded={isSidebarExpanded}>
            <SidebarIcon
              name="View Map"
              isActive={location.pathname === AppRoutes.MAP}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MAP)}
            >
              <MapIcon className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Messaging"
              isActive={location.pathname === AppRoutes.MESSAGING}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MESSAGING)}
            >
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>

          <SidebarTab title="Network" isSidebarExpanded={isSidebarExpanded}>
            <SidebarIcon
              name="Manage Nodes"
              isActive={location.pathname === AppRoutes.MANAGE_NODES}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MANAGE_NODES)}
            >
              <CircleStackIcon className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Manage Waypoints"
              isActive={location.pathname === AppRoutes.MANAGE_WAYPOINTS}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MANAGE_WAYPOINTS)}
            >
              <MapPinIcon className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>

          <SidebarTab
            title="Configuration"
            isSidebarExpanded={isSidebarExpanded}
          >
            <SidebarIcon
              name="Configure Radio"
              isActive={location.pathname === AppRoutes.CONFIGURE_RADIO}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_RADIO)}
            >
              <RadioIcon className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Configure Plugins"
              isActive={location.pathname === AppRoutes.CONFIGURE_PLUGINS}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_PLUGINS)}
            >
              <CubeIcon className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Configure Channels"
              isActive={location.pathname === AppRoutes.CONFIGURE_CHANNELS}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_CHANNELS)}
            >
              <EnvelopeIcon className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>
        </div>

        <div className="">
          <SidebarTab title="Settings" isSidebarExpanded={isSidebarExpanded}>
            <SidebarIcon
              name="Export Data"
              isActive={location.pathname === AppRoutes.EXPORT_APP_DATA}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.EXPORT_APP_DATA)}
            >
              <DocumentArrowDownIcon className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Application Settings"
              isActive={location.pathname === AppRoutes.APPLICATION_SETTINGS}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.APPLICATION_SETTINGS)}
            >
              <Cog8ToothIcon className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>

          <hr className="border-gray-100" />

          <SidebarIcon
            name="Collapse Sidebar"
            isActive={false}
            isSidebarExpanded={isSidebarExpanded}
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
          >
            {isSidebarExpanded ? (
              <ChevronDoubleLeftIcon className="w-6 h-6" />
            ) : (
              <ChevronDoubleRightIcon className="w-6 h-6" />
            )}
          </SidebarIcon>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
