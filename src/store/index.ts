import { configureStore } from "@reduxjs/toolkit";
import { logger } from "redux-logger";
import createSagaMiddleware from "redux-saga";

import { requestInitializeApplication } from "@features/device/actions";

import { appConfigReducer } from "@features/appConfig/slice";
import { configReducer } from "@features/config/slice";
import { connectionReducer } from "@features/connection/slice";
import { deviceReducer } from "@features/device/slice";
import { mapReducer } from "@features/map/slice";
import { requestReducer } from "@features/requests/slice";
import { uiReducer } from "@features/ui/slice";

import { rootSaga } from "@store/saga";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware, logger];

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

sagaMiddleware.run(rootSaga);

store.dispatch(requestInitializeApplication());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
