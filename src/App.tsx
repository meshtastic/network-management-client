import { useState } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import { Sidebar } from "@components/Sidebar/Sidebar";
import { SplashScreen } from "@components/SplashScreen/SplashScreen";

import { ModuleConfigPage } from "@app/components/pages/config/ModuleConfigPage";
import { ApplicationStatePage } from "@components/pages/ApplicationStatePage";
import { ConnectPage } from "@components/pages/ConnectPage";
import { FallbackPage } from "@components/pages/FallbackPage";
import { ManageNodePage } from "@components/pages/ManageNodePage";
import { ManageWaypointPage } from "@components/pages/ManageWaypointPage";
import { MapPage } from "@components/pages/MapPage";
import { MessagingPage } from "@components/pages/MessagingPage";
import { ApplicationSettingsPage } from "@components/pages/config/ApplicationSettingsPage";
import { ChannelConfigPage } from "@components/pages/config/ChannelConfigPage";
import { RadioConfigPage } from "@components/pages/config/RadioConfigPage";
import { GraphDebuggerPage } from "@components/pages/GraphDebuggerPage";

import { AppRoutes } from "@utils/routing";

const AppWrapper = () => (
  <>
    <Sidebar />
    <Outlet />
  </>
);

export const App = () => {
  // Bool to allow/disallow the splash screen at startup
  const splashEnabled = true;

  const [isSplashMounted, setSplashMounted] = useState(splashEnabled);
  const [isOnboardMounted, setOnboardMounted] = useState(true);

  const handleSplashUnmount = () => {
    setSplashMounted(false);
  };

  const handleOnboardUnmount = () => {
    setOnboardMounted(false);
  };

  return (
    <div className="flex flex-row relative">
      {isSplashMounted && <SplashScreen unmountSelf={handleSplashUnmount} />}
      {isOnboardMounted && <ConnectPage unmountSelf={handleOnboardUnmount} />}

      <Routes>
        <Route path="/" element={<AppWrapper />}>
          <Route index element={<MapPage />} />
          <Route path={AppRoutes.MESSAGING} element={<MessagingPage />} />

          <Route
            path={AppRoutes.MANAGE_WAYPOINTS}
            element={<ManageWaypointPage />}
          />
          <Route path={AppRoutes.MANAGE_NODES} element={<ManageNodePage />} />

          <Route
            path={`${AppRoutes.CONFIGURE_RADIO}/:configKey?`}
            element={<RadioConfigPage />}
          />
          <Route
            path={`${AppRoutes.CONFIGURE_MODULES}/:configKey?`}
            element={<ModuleConfigPage />}
          />
          <Route
            path={`${AppRoutes.CONFIGURE_CHANNELS}/:channelId?`}
            element={<ChannelConfigPage />}
          />
          <Route
            path={AppRoutes.APPLICATION_STATE}
            element={<ApplicationStatePage />}
          />

          <Route
            path={AppRoutes.APPLICATION_SETTINGS}
            element={<ApplicationSettingsPage />}
          />

          <Route
            path={AppRoutes.GRAPH_DEBUGGER}
            element={<GraphDebuggerPage />}
          />

          <Route path="*" element={<FallbackPage />} />
        </Route>
      </Routes>
    </div>
  );
};
