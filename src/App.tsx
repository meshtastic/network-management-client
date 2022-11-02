import React from "react";
import Sidebar from "@components/Sidebar/Sidebar";
import Map from "@components/Map/Map";

const App = () => {
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="flex-1 bg-gray-100">
        <Map />
      </div>
    </div>
  );
};

export default App;
