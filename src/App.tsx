import React, { useState } from "react";
import Sidebar from "@components/Sidebar/Sidebar";
import { MapView } from "@components/Map/MapView";
import SplashScreen from "@components/SplashScreen/SplashScreen";

const App = () => {
  const [isSplashMounted, setSplashMounted] = useState(true);

  return (
    <div className="flex flex-row relative">
      {isSplashMounted && (
        <SplashScreen unmountSelf={() => setSplashMounted(false)} />
      )}
      <Sidebar />
      <div className="h-screen flex-1 bg-gray-100">
        <MapView />
      </div>
    </div>
  );
};

export default App;
