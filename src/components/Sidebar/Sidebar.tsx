import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ChevronsLeft,
  ChevronsRight,
  Component,
  FileDigit,
  Mails,
  Map,
  MapPin,
  MessagesSquare,
  RadioTower,
  Router,
  Settings,
} from "lucide-react";

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
      className={`shrink-0 sidebar-width-transition flex flex-col h-screen box-content shadow-lg border-r border-gray-100 overflow-x-hidden ${
        isSidebarExpanded ? "w-[300px] text-gray-500" : "w-20 text-white"
      }`}
    >
      <SidebarLogo isSidebarExpanded={isSidebarExpanded} />

      <div className="flex flex-col flex-1 justify-between px-4 pt-4 pb-1 overflow-y-auto hide-scrollbar">
        <div className="flex flex-col gap-6 mb-6">
          <SidebarTab title="Overview" isSidebarExpanded={isSidebarExpanded}>
            <SidebarIcon
              name="View Map"
              isActive={location.pathname === AppRoutes.MAP}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MAP)}
            >
              <Map strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Messaging"
              isActive={location.pathname === AppRoutes.MESSAGING}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MESSAGING)}
            >
              <MessagesSquare strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>

          <SidebarTab title="Network" isSidebarExpanded={isSidebarExpanded}>
            <SidebarIcon
              name="Manage Nodes"
              isActive={location.pathname === AppRoutes.MANAGE_NODES}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MANAGE_NODES)}
            >
              <RadioTower strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Manage Waypoints"
              isActive={location.pathname === AppRoutes.MANAGE_WAYPOINTS}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MANAGE_WAYPOINTS)}
            >
              <MapPin strokeWidth={1.5} className="w-6 h-6 stroke-3/2" />
            </SidebarIcon>
          </SidebarTab>

          <SidebarTab
            title="Configuration"
            isSidebarExpanded={isSidebarExpanded}
          >
            <SidebarIcon
              name="Configure Radio"
              isActive={location.pathname.includes(AppRoutes.CONFIGURE_RADIO)}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_RADIO)}
            >
              <Router strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Configure Modules"
              isActive={location.pathname.includes(AppRoutes.CONFIGURE_PLUGINS)}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_PLUGINS)}
            >
              <Component strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Configure Channels"
              isActive={location.pathname.includes(
                AppRoutes.CONFIGURE_CHANNELS
              )}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_CHANNELS)}
            >
              <Mails strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>
        </div>

        <div className="">
          <SidebarTab title="Settings" isSidebarExpanded={isSidebarExpanded}>
            <SidebarIcon
              name="Application State"
              isActive={location.pathname === AppRoutes.APPLICATION_STATE}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.APPLICATION_STATE)}
            >
              <FileDigit strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name="Application Settings"
              isActive={location.pathname === AppRoutes.APPLICATION_SETTINGS}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.APPLICATION_SETTINGS)}
            >
              <Settings strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>
        </div>
      </div>

      <div className="flex flex-col mt-auto justify-between px-4 pt-4 pb-1">
        <hr className="border-gray-100" />

        <SidebarIcon
          name="Collapse Sidebar"
          isActive={false}
          isSidebarExpanded={isSidebarExpanded}
          onClick={() => setSidebarExpanded(!isSidebarExpanded)}
        >
          {isSidebarExpanded ? (
            <ChevronsLeft strokeWidth={1.5} className="w-6 h-6" />
          ) : (
            <ChevronsRight strokeWidth={1.5} className="w-6 h-6" />
          )}
        </SidebarIcon>
      </div>
    </div>
  );
};

export default Sidebar;
