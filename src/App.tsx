import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import SplashScreen from "@components/SplashScreen/SplashScreen";
import Sidebar from "@components/Sidebar/Sidebar";

import HomePage from "@components/pages/HomePage";
import SerialConnectPage from "@components/pages/SerialConnectPage";
import FallbackPage from "@components/pages/FallbackPage";
import OnboardPage from "@components/pages/OnboardPage";
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
        <OnboardPage unmountSelf={() => setOnboardMounted(false)} />
      )}

      <Routes>
        <Route path="*" element={<AppWrapper />}>
          <Route index element={<HomePage />} />
          <Route path="messaging" element={<MessagingPage />} />
          <Route path="serial-connect" element={<SerialConnectPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<FallbackPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
