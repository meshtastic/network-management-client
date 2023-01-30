import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { logger } from "redux-logger";

import { deviceReducer } from "@features/device/deviceSlice";
import { requestReducer } from "@features/requests/requestReducer";
import rootSaga from "@store/saga";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware, logger];

export const store = configureStore({
  reducer: {
    devices: deviceReducer,
    requests: requestReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(middleware),
  devTools: true,
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
