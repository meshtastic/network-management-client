import { invoke } from "@tauri-apps/api";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import merge from "lodash.merge";
import cloneDeep from "lodash.clonedeep";

import type { app_ipc_DeviceBulkConfig } from "@bindings/index";

import { requestCommitConfig } from "@features/config/configActions";
import {
  selectCurrentModuleConfig,
  selectCurrentRadioConfig,
  selectEditedModuleConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";
import { configSliceActions } from "@features/config/configSlice";

import { selectPrimarySerialPort } from "@features/device/deviceSelectors";
import { requestSliceActions } from "@features/requests/requestReducer";
import type { CommandError } from "@utils/errors";

function* commitConfigWorker(action: ReturnType<typeof requestCommitConfig>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const fieldFlags = action.payload;

    const includeRadioConfig = fieldFlags.includes("radio");
    const includeModuleConfig = fieldFlags.includes("module");
    const includeChannelConfig = fieldFlags.includes("channel");

    const activePort = (yield select(selectPrimarySerialPort())) as
      | string
      | null;

    if (!activePort) {
      throw new Error("No active port");
    }

    // Get current and edited config

    const currentRadioConfig = (yield select(
      selectCurrentRadioConfig()
    )) as ReturnType<ReturnType<typeof selectCurrentRadioConfig>>;

    const editedRadioConfig = (yield select(
      selectEditedRadioConfig()
    )) as ReturnType<ReturnType<typeof selectEditedRadioConfig>>;

    const currentModuleConfig = (yield select(
      selectCurrentModuleConfig()
    )) as ReturnType<ReturnType<typeof selectCurrentModuleConfig>>;

    const editedModuleConfig = (yield select(
      selectEditedRadioConfig()
    )) as ReturnType<ReturnType<typeof selectEditedModuleConfig>>;

    if (!currentRadioConfig || !currentModuleConfig) {
      throw new Error("Current radio or module config not defined");
    }

    const configPayload: app_ipc_DeviceBulkConfig = {
      radio: null,
      module: null,
      channels: includeChannelConfig ? null : null,
    };

    // Update config payload based on flags

    if (includeRadioConfig) {
      configPayload.radio = merge(
        cloneDeep(currentRadioConfig), // Redux object
        editedRadioConfig
      );
    }

    if (includeModuleConfig) {
      configPayload.module = merge(
        cloneDeep(currentModuleConfig), // Redux object
        editedModuleConfig
      );
    }

    if (includeChannelConfig) {
      // TODO set channel config
    }

    // Dispatch update to backend

    yield call(invoke, "update_device_config_bulk", {
      portName: activePort,
      config: configPayload,
    });

    // Clear temporary config fields

    if (includeRadioConfig) {
      yield put(configSliceActions.clearRadioConfig());
    }

    if (includeModuleConfig) {
      yield put(configSliceActions.clearModuleConfig());
    }

    if (includeChannelConfig) {
      // TODO clear channel config
    }

    yield put(requestSliceActions.setRequestSuccessful({ name: action.type }));
  } catch (error) {
    yield put(
      requestSliceActions.setRequestFailed({
        name: action.type,
        message: (error as CommandError).message,
      })
    );
  }
}

export function* configSaga() {
  yield all([takeEvery(requestCommitConfig.type, commitConfigWorker)]);
}
