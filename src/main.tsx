import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { listen } from "@tauri-apps/api/event";

import App from "@app/App";
import type { MeshDevice } from "@bindings/MeshDevice";
import { store } from "@store/index";

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

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
