import React from "react";
import Sidebar from "./Components/Sidebar/Sidebar";
import { MapView } from "./Components/Map/MapView";
import { Route, Routes } from "react-router-dom";
import Settings from "./Components/Settings/Settings";

const App = () => {
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="h-screen flex-1 bg-gray-100">
        <MapView />
      </div>
      <Settings trigger={true} />
    </div>
  );
};

export default App;
