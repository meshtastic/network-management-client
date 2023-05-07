import { invoke } from "@tauri-apps/api";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import merge from 'lodash.merge';

import type { app_ipc_DeviceBulkConfig } from "@bindings/index";

import { requestCommitConfig } from "@features/config/configActions";
import {
  selectCurrentModuleConfig,
  selectCurrentRadioConfig,
  selectEditedModuleConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";

import { requestSliceActions } from "@features/requests/requestReducer";
import type { CommandError } from "@utils/errors";
import { selectPrimarySerialPort } from "../device/deviceSelectors";

function* commitConfigWorker(action: ReturnType<typeof requestCommitConfig>) {
  try {
    yield put(requestSliceActions.setRequestPending({ name: action.type }));

    const activePort = (yield select(selectPrimarySerialPort())) as string | null;

    if (!activePort) {
      throw new Error("No active port");
    }

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

    console.log('currentRadioConfig', currentRadioConfig);
    console.log('editedRadioConfig', editedRadioConfig);
    // TODO channel config

    if (!currentRadioConfig || !currentModuleConfig) {
      throw new Error("Current radio or module config not defined");
    }

    const configPayload: app_ipc_DeviceBulkConfig = {
      radio: merge(JSON.parse(JSON.stringify(currentRadioConfig)) as typeof currentRadioConfig, editedRadioConfig),
      module: merge(JSON.parse(JSON.stringify(currentModuleConfig)) as typeof currentModuleConfig, editedModuleConfig),
      channels: null,
    };

    yield call(invoke, "update_device_config_bulk", { portName: activePort, config: configPayload });

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
