import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import SplashScreen from "@components/SplashScreen/SplashScreen";
import Sidebar from "@components/Sidebar/Sidebar";

import HomePage from "@components/pages/HomePage";
import SerialConnectPage from "@components/pages/SerialConnectPage";
import FallbackPage from "@components/pages/FallbackPage";
import OnboardPage from "@components/pages/OnboardPage";
import MessagingPage from "@components/pages/MessagingPage";

const AppWrapper = () => (
  <>
    <Sidebar />
    <Outlet />
  </>
);

const App = () => {
  const [isSplashMounted, setSplashMounted] = useState(true);
  const [isOnboardMounted, setOnboardMounted] = useState(true);

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
          <Route path="*" element={<FallbackPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
