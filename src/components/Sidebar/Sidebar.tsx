import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ChevronsLeft,
  ChevronsRight,
  Component,
  FileDigit,
  Mails,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: Need named export
  Map,
  MapPin,
  MessagesSquare,
  Network,
  RadioTower,
  Router,
  Settings,
} from "lucide-react";

import { SidebarIcon } from "@components/Sidebar/SidebarIcon";
import { SidebarLogo } from "@components/Sidebar/SidebarLogo";
import { SidebarTab } from "@components/Sidebar/SidebarTab";
import { ConnectionStatus } from "@components/Sidebar/ConnectionStatus";

import { AppRoutes } from "@utils/routing";

import "@components/Sidebar/Sidebar.css";

export const Sidebar = ({ onShowConnect }: { onShowConnect?: () => void }) => {
  const { t } = useTranslation();

  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  const navigateTo = useNavigate();
  const location = useLocation();

  return (
    <div
      className={`shrink-0 sidebar-width-transition flex flex-col h-screen box-content bg-white dark:bg-gray-800 shadow-lg border-r border-gray-100 dark:border-gray-700 overflow-x-hidden ${
        isSidebarExpanded
          ? "w-[300px] text-gray-500 dark:text-gray-400"
          : "w-20 text-white dark:text-gray-800"
      }`}
    >
      <SidebarLogo isSidebarExpanded={isSidebarExpanded} />

      {isSidebarExpanded && onShowConnect && (
        <ConnectionStatus onDisconnect={onShowConnect} />
      )}

      <div className="flex flex-col flex-1 justify-between px-4 pt-4 pb-1 overflow-y-auto hide-scrollbar">
        <div className="flex flex-col gap-6 mb-6">
          <SidebarTab
            title={t("sidebar.overviewGroup")}
            isSidebarExpanded={isSidebarExpanded}
          >
            <SidebarIcon
              name={t("sidebar.viewMap")}
              isActive={location.pathname === AppRoutes.MAP}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MAP)}
            >
              <Map strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name={t("sidebar.messaging")}
              isActive={location.pathname === AppRoutes.MESSAGING}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MESSAGING)}
            >
              <MessagesSquare strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>

          <SidebarTab
            title={t("sidebar.networkGroup")}
            isSidebarExpanded={isSidebarExpanded}
          >
            <SidebarIcon
              name={t("sidebar.manageNodes")}
              isActive={location.pathname === AppRoutes.MANAGE_NODES}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MANAGE_NODES)}
            >
              <RadioTower strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name={t("sidebar.manageWaypoints")}
              isActive={location.pathname === AppRoutes.MANAGE_WAYPOINTS}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.MANAGE_WAYPOINTS)}
            >
              <MapPin strokeWidth={1.5} className="w-6 h-6 stroke-3/2" />
            </SidebarIcon>
          </SidebarTab>

          <SidebarTab
            title={t("sidebar.configurationGroup")}
            isSidebarExpanded={isSidebarExpanded}
          >
            <SidebarIcon
              name={t("sidebar.configureRadio")}
              isActive={location.pathname.includes(AppRoutes.CONFIGURE_RADIO)}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_RADIO)}
            >
              <Router strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name={t("sidebar.configureModules")}
              isActive={location.pathname.includes(AppRoutes.CONFIGURE_MODULES)}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_MODULES)}
            >
              <Component strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name={t("sidebar.configureChannels")}
              isActive={location.pathname.includes(
                AppRoutes.CONFIGURE_CHANNELS,
              )}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.CONFIGURE_CHANNELS)}
            >
              <Mails strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>
          </SidebarTab>
        </div>

        <div className="">
          <SidebarTab
            title={t("sidebar.settingsGroup")}
            isSidebarExpanded={isSidebarExpanded}
          >
            <SidebarIcon
              name={t("sidebar.graphDebugger")}
              isActive={location.pathname === AppRoutes.GRAPH_DEBUGGER}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.GRAPH_DEBUGGER)}
            >
              <Network strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name={t("sidebar.applicationState")}
              isActive={location.pathname === AppRoutes.APPLICATION_STATE}
              isSidebarExpanded={isSidebarExpanded}
              onClick={() => navigateTo(AppRoutes.APPLICATION_STATE)}
            >
              <FileDigit strokeWidth={1.5} className="w-6 h-6" />
            </SidebarIcon>

            <SidebarIcon
              name={t("sidebar.applicationSettings")}
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
        <hr className="border-gray-100 dark:border-gray-700" />

        <SidebarIcon
          name={isSidebarExpanded ? t("sidebar.collapse") : t("sidebar.expand")}
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
