import React from "react";
import Sidebar from "@components/Sidebar/Sidebar";
import { MapView } from "@components/Map/MapView";

const App = () => {
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="h-screen flex-1 bg-gray-100">
        <MapView />
      </div>
    </div>
  );
};

export default App;
