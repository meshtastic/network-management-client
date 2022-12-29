import React, { useState } from "react";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";

import SplashScreen from "@components/SplashScreen/SplashScreen";
import Sidebar from "@components/Sidebar/Sidebar";
import HomePage from "@components/pages/Home";

const AppWrapper = () => (
  <>
    <Sidebar />
    <Outlet />
  </>
);

const SerialConnect = () => (
  <div>
    <p>Serial connection page</p>
    <NavLink to="/">Home</NavLink>
  </div>
);

const Fallback = () => <NavLink to="/">Go home</NavLink>;

const App = () => {
  const [isSplashMounted, setSplashMounted] = useState(true);

  return (
    <div className="flex flex-row relative">
      {isSplashMounted && (
        <SplashScreen unmountSelf={() => setSplashMounted(false)} />
      )}

      <Routes>
        <Route path="*" element={<AppWrapper />}>
          <Route index element={<HomePage />} />
          <Route path="serial-connect" element={<SerialConnect />} />
          <Route path="*" element={<Fallback />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
