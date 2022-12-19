import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { listen } from "@tauri-apps/api/event";

import { store } from "@store/index";
import App from "./App";

import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

// ---- standard packets ---- //

// listen("channel", (event) => {
//   console.log("channel", event.payload);
// })
//   .then((unlisten) => {
//     return unlisten;
//   })
//   .catch(console.error);

// listen("config", (event) => {
//   console.log("config", event.payload);
// })
//   .then((unlisten) => {
//     return unlisten;
//   })
//   .catch(console.error);

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

// listen("module_config", (event) => {
//   console.log("module_config", event.payload);
// })
//   .then((unlisten) => {
//     return unlisten;
//   })
//   .catch(console.error);

listen("my_node_info", (event) => {
  console.log("my_node_info", event.payload);
})
  .then((unlisten) => {
    return unlisten;
  })
  .catch(console.error);

// listen("node_info", (event) => {
//   console.log("node_info", event.payload);
// })
//   .then((unlisten) => {
//     return unlisten;
//   })
//   .catch(console.error);

listen("reboot", (event) => {
  console.log("reboot", event.payload);
})
  .then((unlisten) => {
    return unlisten;
  })
  .catch(console.error);

// ---- mesh packets ---- //

// listen("position", (event) => {
//   console.log("position", event.payload);
// })
//   .then((unlisten) => {
//     return unlisten;
//   })
//   .catch(console.error);

// listen("routing", (event) => {
//   console.log("routing", event.payload);
// })
//   .then((unlisten) => {
//     return unlisten;
//   })
//   .catch(console.error);

// listen("telemetry", (event) => {
//   console.log("telemetry", event.payload);
// })
//   .then((unlisten) => {
//     return unlisten;
//   })
//   .catch(console.error);

// listen("text", (event) => {
//   const decoder = new TextDecoder();
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
//   const text = decoder.decode(new Uint8Array((event.payload as any).payload));
//   console.log("text", text);
// })
//   .then((unlisten) => {
//     return unlisten;
//   })
//   .catch(console.error);

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
