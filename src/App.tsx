import React, { useEffect } from "react";
import Sidebar from "@components/Sidebar/Sidebar";
import { MapView } from "@components/Map/MapView";
import { listen } from "@tauri-apps/api/event";

const App = () => {
  useEffect(() => {
    listen("demo", (event) => console.log("event", event))
      .then((unlisten) => {
        return unlisten;
      })
      .catch(console.error);
  }, []);

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
