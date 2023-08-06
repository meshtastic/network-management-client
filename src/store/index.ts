import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { logger } from "redux-logger";

import { requestInitializeApplication } from "@features/device/deviceActions";

import { algorithmsReducer } from "@features/algorithms/algorithmsSlice";
import { appConfigReducer } from "@features/appConfig/appConfigSlice";
import { configReducer } from "@features/config/configSlice";
import { connectionReducer } from "@features/connection/connectionSlice";
import { deviceReducer } from "@features/device/deviceSlice";
import { mapReducer } from "@features/map/mapSlice";
import { requestReducer } from "@features/requests/requestSlice";
import { uiReducer } from "@features/ui/slice";

import rootSaga from "@store/saga";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware, logger];

export const store = configureStore({
  reducer: {
    algorithms: algorithmsReducer,
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
