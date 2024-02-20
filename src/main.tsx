import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { MapProvider } from "react-map-gl";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { App } from "@app/App";
import { AppInitWrapper } from "@components/AppInitWrapper";
import { store } from "@store/index";

// Load translations
import "./i18n";

import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading locales...</div>}>
      <BrowserRouter>
        <Provider store={store}>
          <AppInitWrapper>
            <MapProvider>
              <App />
            </MapProvider>
          </AppInitWrapper>
        </Provider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
);
