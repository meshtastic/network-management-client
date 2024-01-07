import { listen } from "@tauri-apps/api/event";
import { EventChannel, eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";

import type { app_device_MeshDevice } from "@bindings/index";

import { connectionSliceActions } from "@features/connection/slice";
import { requestDisconnectFromDevice } from "@features/device/actions";
import { deviceSliceActions } from "@features/device/slice";
import { mapSliceActions } from "@features/map/slice";

import type { DeviceKey } from "@utils/connections";

export type GraphGeoJSONResult = {
  nodes: GeoJSON.FeatureCollection;
  edges: GeoJSON.FeatureCollection;
};

export type DeviceUpdateChannel = EventChannel<app_device_MeshDevice>;
export type DeviceDisconnectChannel = EventChannel<string>;
export type GraphUpdateChannel = EventChannel<GraphGeoJSONResult>;
export type ConfigStatusChannel = EventChannel<boolean>;
export type RebootChannel = EventChannel<number>;

function* handleSagaError(error: unknown) {
  yield put({ type: "GENERAL_ERROR", payload: error });
}

export const createDeviceUpdateChannel = (): DeviceUpdateChannel => {
  return eventChannel((emitter) => {
    listen<app_device_MeshDevice>("device_update", (event) => {
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
      const meshDevice: app_device_MeshDevice = yield take(channel);
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
      const portName: string = yield take(channel);
      yield put(requestDisconnectFromDevice(portName));
      window.location.reload();
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}

export const createGraphUpdateChannel = (): GraphUpdateChannel => {
  return eventChannel((emitter) => {
    listen<GraphGeoJSONResult>("graph_update", (event) => {
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
      const { nodes, edges }: GraphGeoJSONResult = yield take(channel);

      yield put(mapSliceActions.setNodesFeatureCollection(nodes));
      yield put(mapSliceActions.setEdgesFeatureCollection(edges));
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
      const {
        successful,
        deviceKey,
        message,
      }: {
        successful: boolean;
        deviceKey: DeviceKey;
        message: string | null;
      } = yield take(channel);

      if (!successful) {
        yield put(requestDisconnectFromDevice(deviceKey));
      }

      yield put(
        connectionSliceActions.setConnectionState({
          deviceKey: deviceKey,
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

export const createRebootChannel = (): RebootChannel => {
  return eventChannel((emitter) => {
    listen<number>("reboot", (event) => {
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

export function* handleRebootChannel(channel: RebootChannel) {
  try {
    while (true) {
      const timestamp_sec: number = yield take(channel);
      const reboot_time = new Date(timestamp_sec * 1000);
      console.warn("Rebooting at", reboot_time);
      window.location.reload();
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}
