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
import DefaultTooltip from "@components/DefaultTooltip";

const Sidebar = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  const navigateTo = useNavigate();
  const location = useLocation();

  return (
    <div
      className={`shrink-0 sidebar-width-transition flex flex-col h-screen box-content shadow-lg overflow-y-auto hide-scrollbar border-r border-gray-100 overflow-x-hidden ${
        isSidebarExpanded ? "w-[300px] text-gray-500" : "w-20 text-white"
      }`}
    >
      <SidebarLogo isSidebarExpanded={isSidebarExpanded} />

      <div className="flex flex-col flex-1 justify-between px-4 pt-4 pb-1">
        <div className="flex flex-col gap-6 mb-6">
          <SidebarTab title="Overview" isSidebarExpanded={isSidebarExpanded}>
            <DefaultTooltip text="Messaging" deactivated={isSidebarExpanded}>
              <button>
              <SidebarIcon
                name="Messaging"
                isActive={location.pathname === AppRoutes.MESSAGING }
                isSidebarExpanded={isSidebarExpanded}
                onClick={() => navigateTo(AppRoutes.MESSAGING)}
              >
                <MessagesSquare strokeWidth={1.5} className="w-6 h-6" />
              </SidebarIcon>
              </button>
            </DefaultTooltip>
          </SidebarTab>

          <SidebarTab title="Network" isSidebarExpanded={isSidebarExpanded}>
            <DefaultTooltip text="Manage Nodes" deactivated={isSidebarExpanded}>
              <button>
              <SidebarIcon
                name="Manage Nodes"
                isActive={location.pathname === AppRoutes.MANAGE_NODES}
                isSidebarExpanded={isSidebarExpanded}
                onClick={() => navigateTo(AppRoutes.MANAGE_NODES)}
              >
                <RadioTower strokeWidth={1.5} className="w-6 h-6" />
              </SidebarIcon>
              </button>
            </DefaultTooltip>
            <DefaultTooltip text="Manage Waypoints" deactivated={isSidebarExpanded}>
              <button>
              <SidebarIcon
                name="Manage Waypoints"
                isActive={location.pathname === AppRoutes.MANAGE_WAYPOINTS}
                isSidebarExpanded={isSidebarExpanded}
                onClick={() => navigateTo(AppRoutes.MANAGE_WAYPOINTS)}
              >
                <MapPin strokeWidth={1.5} className="w-6 h-6 stroke-3/2" />
              </SidebarIcon>
              </button>
            </DefaultTooltip>
          </SidebarTab>

          <SidebarTab
            title="Configuration"
            isSidebarExpanded={isSidebarExpanded}
          >
            <DefaultTooltip text="Configure Radio" deactivated={isSidebarExpanded}>
              <button>
              <SidebarIcon
                name="Configure Radio"
                isActive={location.pathname.includes(AppRoutes.CONFIGURE_RADIO)}
                isSidebarExpanded={isSidebarExpanded}
                onClick={() => navigateTo(AppRoutes.CONFIGURE_RADIO)}
              >
                <Router strokeWidth={1.5} className="w-6 h-6" />
              </SidebarIcon>
              </button>
            </DefaultTooltip>

            <DefaultTooltip text="Configure Modules" deactivated={isSidebarExpanded}>
              <button>
              <SidebarIcon
                name="Configure Modules"
                isActive={location.pathname.includes(
                  AppRoutes.CONFIGURE_PLUGINS
                )}
                isSidebarExpanded={isSidebarExpanded}
                onClick={() => navigateTo(AppRoutes.CONFIGURE_PLUGINS)}
              >
                <Component strokeWidth={1.5} className="w-6 h-6" />
              </SidebarIcon>
              </button>
            </DefaultTooltip>

            <DefaultTooltip text="Configure Channels" deactivated={isSidebarExpanded}>
              <button>
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
              </button>
            </DefaultTooltip>
          </SidebarTab>
        </div>

        <div className="">
          <SidebarTab title="Settings" isSidebarExpanded={isSidebarExpanded}>
            <DefaultTooltip text="Application State" deactivated={isSidebarExpanded}>
              <button>
              <SidebarIcon
                name="Application State"
                isActive={location.pathname === AppRoutes.APPLICATION_STATE}
                isSidebarExpanded={isSidebarExpanded}
                onClick={() => navigateTo(AppRoutes.APPLICATION_STATE)}
              >
                <FileDigit strokeWidth={1.5} className="w-6 h-6" />
              </SidebarIcon>
              </button>
            </DefaultTooltip>

            <DefaultTooltip text="Application Settings" deactivated={isSidebarExpanded}>
              <button>
              <SidebarIcon
                name="Application Settings"
                isActive={location.pathname === AppRoutes.APPLICATION_SETTINGS}
                isSidebarExpanded={isSidebarExpanded}
                onClick={() => navigateTo(AppRoutes.APPLICATION_SETTINGS)}
              >
                <Settings strokeWidth={1.5} className="w-6 h-6" />
              </SidebarIcon>
              </button>
            </DefaultTooltip>
          </SidebarTab>

          <hr className="border-gray-100" />
          <DefaultTooltip text="Collapse Sidebar" deactivated={isSidebarExpanded}>
            <button>
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
            </button>
          </DefaultTooltip>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
