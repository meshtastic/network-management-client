import { configureStore } from "@reduxjs/toolkit";
import { logger } from "redux-logger";

import { appConfigReducer } from "@features/appConfig/slice";
import { configReducer } from "@features/config/slice";
import { connectionReducer } from "@features/connection/slice";
import { deviceReducer } from "@features/device/slice";
import { mapReducer } from "@features/map/slice";
import { requestReducer } from "@features/requests/slice";
import { uiReducer } from "@features/ui/slice";

const middleware = [logger];

export const store = configureStore({
  reducer: {
    appConfig: appConfigReducer,
    config: configReducer,
    connection: connectionReducer,
    devices: deviceReducer,
    map: mapReducer,
    requests: requestReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
