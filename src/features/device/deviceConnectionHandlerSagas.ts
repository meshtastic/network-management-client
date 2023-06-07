import { EventChannel, eventChannel } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { listen } from "@tauri-apps/api/event";

import type { app_device_MeshDevice } from "@bindings/index";

import { connectionSliceActions } from "@features/connection/connectionSlice";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { requestDisconnectFromDevice } from "@features/device/deviceActions";
import { mapSliceActions } from "@features/map/mapSlice";
import { error } from "@utils/errors";

export type GraphGeoJSONResult = {
  nodes: GeoJSON.FeatureCollection,
  edges: GeoJSON.FeatureCollection
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  channel: DeviceDisconnectChannel
) {
  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const {
        successful,
        portName,
        socketAddress,
        message,
      }: {
        successful: boolean;
        portName?: string;
        socketAddress?: string;
        message: string | null;
      } = yield take(channel);

      const target = portName ?? socketAddress ?? error("Neither portName nor socketAddress are configured");
      if (!successful) {
        yield put(requestDisconnectFromDevice(target));
      }

      yield put(
        connectionSliceActions.setConnectionState({
          identifier: target,
          status: successful
            ? { status: "SUCCESSFUL" }
            : { status: "FAILED", message: message ?? "" },
        })
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const timestamp_sec: number = yield take(channel);
      const reboot_time = new Date(timestamp_sec * 1000);
      console.warn("Rebooting at", reboot_time);
      window.location.reload();
    }
  } catch (error) {
    yield call(handleSagaError, error);
  }
}
