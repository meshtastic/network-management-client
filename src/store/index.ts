import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import counterSlice from 'features/counter/counterSlice';
import rootSaga from 'store/saga';

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

export const store = configureStore({
    reducer: { counter: counterSlice },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(middleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
