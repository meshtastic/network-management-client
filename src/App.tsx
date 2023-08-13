import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import CustomTitlebar from "@components/CustomTitlebar";
import SplashScreen from "@components/SplashScreen/SplashScreen";
import Sidebar from "@components/Sidebar/Sidebar";

import MapPage from "@components/pages/MapPage";
import FallbackPage from "@components/pages/FallbackPage";
import ConnectPage from "@components/pages/ConnectPage";
import MessagingPage from "@components/pages/MessagingPage";
import ManageWaypointPage from "@components/pages/ManageWaypointPage";
import ManageNodePage from "@components/pages/ManageNodePage";
import RadioConfigPage from "@components/pages/config/RadioConfigPage";
import ModuleConfigPage from "@app/components/pages/config/ModuleConfigPage";
import ChannelConfigPage from "@components/pages/config/ChannelConfigPage";
import ApplicationStatePage from "@components/pages/ApplicationStatePage";
import ApplicationSettingsPage from "@components/pages/config/ApplicationSettingsPage";

import { AppRoutes } from "@utils/routing";

const AppWrapper = () => (
  <>
    <Sidebar />
    <Outlet />
  </>
);

const App = () => {
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
    <div className="relative">
      <CustomTitlebar className="" />

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
            <Route path="*" element={<FallbackPage />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;
