import { call, put } from 'redux-saga/effects';

import { actions as counterActions } from 'features/counter/counterSlice';

const callDemoAPI = async (url: string) => (await fetch(url)).json();

export function* fetchNumberWorkerSaga() {
    try {
        const result: number[] = yield call(callDemoAPI, 'https://www.randomnumberapi.com/api/v1.0/random?min=-1000&max=1000&count=1');
        yield put(counterActions.incrementByAmount(result[0]));
    } catch (error) {
        yield put({ type: 'GENERAL_ERROR', payload: error.message });
    }
}
