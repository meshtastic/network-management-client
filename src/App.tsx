import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import SplashScreen from "@components/SplashScreen/SplashScreen";
import Sidebar from "@components/Sidebar/Sidebar";

import HomePage from "@components/pages/HomePage";
import FallbackPage from "@components/pages/FallbackPage";
import SerialConnectPage from "@components/pages/SerialConnectPage";
import MessagingPage from "@components/pages/MessagingPage";
import Settings from "@components/Settings/Settings";
import ManageWaypointPage from "@components/pages/ManageWaypointPage";
import ManageNodePage from "@components/pages/ManageNodePage";
import RadioConfigPage from "@components/pages/config/RadioConfigPage";
import PluginConfigPage from "@components/pages/config/PluginConfigPage";
import ChannelConfigPage from "@components/pages/config/ChannelConfigPage";

import { requestDeviceConnectionStatus } from "@features/device/deviceActions";
import { selectDeviceConnected } from "@features/device/deviceSelectors";
import { AppRoutes } from "@utils/routing";

const AppWrapper = () => (
  <>
    <Sidebar />
    <Outlet />
  </>
);

const App = () => {
  const dispatch = useDispatch();
  const isDeviceConnected = useSelector(selectDeviceConnected());

  // Bool to allow/disallow the splash screen at startup
  const splashEnabled = true;

  const [isSplashAnimationStarted, setSplashAnimationStarted] = useState(false);
  const [isSplashMounted, setSplashMounted] = useState(splashEnabled);
  const [isOnboardMounted, setOnboardMounted] = useState(true);

  useEffect(() => {
    if (!isSplashAnimationStarted) {
      setOnboardMounted(!isDeviceConnected);
    }
  }, [isDeviceConnected]);

  const handleSplashAnimationStart = () => {
    setSplashAnimationStarted(true);
    dispatch(requestDeviceConnectionStatus());
  };

  const handleSplashUnmount = () => {
    setSplashMounted(false);
  };

  return (
    <div className="flex flex-row relative">
      {isSplashMounted && (
        <SplashScreen
          onAnimationStart={handleSplashAnimationStart}
          unmountSelf={handleSplashUnmount}
        />
      )}

      {isOnboardMounted && (
        <SerialConnectPage unmountSelf={() => setOnboardMounted(false)} />
      )}

      <Routes>
        <Route path="/" element={<AppWrapper />}>
          <Route index element={<HomePage />} />
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

          <Route path={AppRoutes.APPLICATION_SETTINGS} element={<Settings />} />
          <Route path="*" element={<FallbackPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
