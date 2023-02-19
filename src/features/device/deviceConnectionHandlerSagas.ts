import { EventChannel, eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { listen } from "@tauri-apps/api/event";

import type { MeshDevice } from "@bindings/MeshDevice";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestDisconnectFromDevice } from "@features/device/deviceActions";

export type DeviceUpdateChannel = EventChannel<MeshDevice>;
export type DeviceDisconnectChannel = EventChannel<string>;

function* handleSagaError(error: unknown) {
  yield put({ type: "GENERAL_ERROR", payload: error });
}

export const createDeviceUpdateChannel = (): DeviceUpdateChannel => {
  return eventChannel((emitter) => {
    listen<MeshDevice>("device_update", (event) => {
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleDeviceUpdateChannel(channel: DeviceUpdateChannel) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const meshDevice: MeshDevice = yield take(channel);
      yield put(deviceSliceActions.setDevice(meshDevice));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createDeviceDisconnectChannel = (): DeviceDisconnectChannel => {
  return eventChannel((emitter) => {
    listen<string>("device_disconnect", (event) => {
      emitter(event.payload);
    })
      // .then((unlisten) => {
      //   return unlisten;
      // })
      .catch(console.error);

    // TODO UNLISTEN
    return () => null;
  });
};

export function* handleDeviceDisconnectChannel(
  channel: DeviceDisconnectChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      yield take(channel);
      yield put(requestDisconnectFromDevice());
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}
