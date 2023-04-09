import { EventChannel, eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { listen } from "@tauri-apps/api/event";

import type { MeshDevice } from "@bindings/MeshDevice";
import { connectionSliceActions } from "@features/connection/connectionSlice";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestDisconnectFromDevice } from "@features/device/deviceActions";
import { mapSliceActions } from "@features/map/mapSlice";

export type DeviceUpdateChannel = EventChannel<MeshDevice>;
export type DeviceDisconnectChannel = EventChannel<string>;
export type GraphUpdateChannel = EventChannel<GeoJSON.FeatureCollection>;
export type ConfigStatusChannel = EventChannel<boolean>;

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
  channel: DeviceDisconnectChannel,
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      yield take(channel);
      yield put(requestDisconnectFromDevice());
      window.location.reload();
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createGraphUpdateChannel = (): GraphUpdateChannel => {
  return eventChannel((emitter) => {
    listen<GeoJSON.FeatureCollection>("graph_update", (event) => {
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

export function* handleGraphUpdateChannel(channel: GraphUpdateChannel) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const edgeFeatures: GeoJSON.FeatureCollection = yield take(channel);
      yield put(mapSliceActions.setEdgesFeatureCollection(edgeFeatures));
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createConfigStatusChannel = (): ConfigStatusChannel => {
  return eventChannel((emitter) => {
    listen<boolean>("configuration_status", (event) => {
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

export function* handleConfigStatusChannel(channel: ConfigStatusChannel) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { successful, portName, message }: {
        successful: boolean;
        portName: string;
        message: string | null;
      } = yield take(channel);

      yield put(
        connectionSliceActions.setConnectionState({
          portName,
          status: successful
            ? { status: "SUCCESSFUL" }
            : { status: "FAILED", message: message ?? "" },
        }),
      );
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}
