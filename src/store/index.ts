import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { logger } from "redux-logger";

import { algorithmsReducer } from "@features/algorithms/algorithmsSlice";
import { connectionReducer } from "@features/connection/connectionSlice";
import { deviceReducer } from "@features/device/deviceSlice";
import { requestReducer } from "@features/requests/requestReducer";
import { mapReducer } from "@features/map/mapSlice";

import rootSaga from "@store/saga";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware, logger];

export const store = configureStore({
  reducer: {
    algorithms: algorithmsReducer,
    connection: connectionReducer,
    devices: deviceReducer,
    map: mapReducer,
    requests: requestReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(middleware),
  devTools: true,
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
