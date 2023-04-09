import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import SplashScreen from "@components/SplashScreen/SplashScreen";
import Sidebar from "@components/Sidebar/Sidebar";

import MapPage from "@components/pages/MapPage";
import FallbackPage from "@components/pages/FallbackPage";
import SerialConnectPage from "@components/pages/SerialConnectPage";
import MessagingPage from "@components/pages/MessagingPage";
import Settings from "@components/Settings/Settings";
import ManageWaypointPage from "@components/pages/ManageWaypointPage";
import ManageNodePage from "@components/pages/ManageNodePage";
import RadioConfigPage from "@components/pages/config/RadioConfigPage";
import PluginConfigPage from "@components/pages/config/PluginConfigPage";
import ChannelConfigPage from "@components/pages/config/ChannelConfigPage";
import ApplicationStatePage from "@components/pages/ApplicationStatePage";

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

  const handleSerialConnectUnmount = () => {
    setOnboardMounted(false);
  };

  return (
    <div className="flex flex-row relative">
      {isSplashMounted && <SplashScreen unmountSelf={handleSplashUnmount} />}

      {isOnboardMounted && (
        <SerialConnectPage unmountSelf={handleSerialConnectUnmount} />
      )}

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
            path={AppRoutes.CONFIGURE_RADIO}
            element={<RadioConfigPage />}
          />
          <Route
            path={AppRoutes.CONFIGURE_PLUGINS}
            element={<PluginConfigPage />}
          />
          <Route
            path={AppRoutes.CONFIGURE_CHANNELS}
            element={<ChannelConfigPage />}
          />
          <Route
            path={AppRoutes.APPLICATION_STATE}
            element={<ApplicationStatePage />}
          />

          <Route path={AppRoutes.APPLICATION_SETTINGS} element={<Settings />} />
          <Route path="*" element={<FallbackPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
