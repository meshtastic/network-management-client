import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import SplashScreen from "@components/SplashScreen/SplashScreen";
import Sidebar from "@components/Sidebar/Sidebar";

import HomePage from "@components/pages/HomePage";
import FallbackPage from "@components/pages/FallbackPage";
import SerialConnectPage from "@app/components/pages/SerialConnectPage";
import MessagingPage from "@components/pages/MessagingPage";
import Settings from "@components/Settings/Settings";

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
  const [isOnboardMounted, setOnboardMounted] = useState(splashEnabled);

  return (
    <div className="flex flex-row relative">
      {isSplashMounted && (
        <SplashScreen
          unmountSelf={() => {
            setSplashMounted(false);
          }}
        />
      )}

      {isOnboardMounted && (
        <SerialConnectPage unmountSelf={() => setOnboardMounted(false)} />
      )}

      <Routes>
        <Route path="*" element={<AppWrapper />}>
          <Route index element={<HomePage />} />
          <Route path="messaging" element={<MessagingPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<FallbackPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
