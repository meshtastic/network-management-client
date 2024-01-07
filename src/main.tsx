import { listen } from "@tauri-apps/api/event";
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { MapProvider } from "react-map-gl";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "@app/App";
import { store } from "@store/index";

// Load translations
import "./i18n";

import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

listen("config_complete", (event) => {
  console.log("config_complete", event.payload);
})
  .then((unlisten) => {
    return unlisten;
  })
  .catch(console.error);

listen("log_record", (event) => {
  console.log("log_record", event.payload);
})
  .then((unlisten) => {
    return unlisten;
  })
  .catch(console.error);

listen("my_node_info", (event) => {
  console.log("my_node_info", event.payload);
})
  .then((unlisten) => {
    return unlisten;
  })
  .catch(console.error);

listen("reboot", (event) => {
  console.log("reboot", event.payload);
})
  .then((unlisten) => {
    return unlisten;
  })
  .catch(console.error);

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading locales...</div>}>
      <BrowserRouter>
        <Provider store={store}>
          <MapProvider>
            <App />
          </MapProvider>
        </Provider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
);
