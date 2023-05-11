import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  DeviceConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IDeviceConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseDeviceConfigInput = (
  d: DeepPartial<DeviceConfigInput>
): DeepPartial<DeviceConfigInput> => ({
  ...d,
  nodeInfoBroadcastSecs: parseInt(d.nodeInfoBroadcastSecs as unknown as string),
  role: parseInt(d.role as unknown as string),
  rebroadcastMode: parseInt(d.rebroadcastMode as unknown as string),
});

const DeviceConfigPage = ({ className = "" }: IDeviceConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.device ?? undefined,
        editedConfig.device ?? undefined
      ),
    []
  );

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<DeviceConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<DeviceConfigInput>) => {
          const data = parseDeviceConfigInput(d);
          dispatch(configSliceActions.updateRadioConfig({ device: data }));
        },
        500,
        { leading: true }
      ),
    []
  );

  useEffect(() => {
    return () => updateConfigHander.cancel();
  }, []);

  watch(updateConfigHander);

  const handleFormReset = () => {
    if (!currentConfig?.device) return;
    reset(currentConfig.device);
    dispatch(configSliceActions.updateRadioConfig({ device: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Device Configuration"}
        subtitle={"Configure device"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigLabel text="Device Role" error={errors.role?.message}>
            <select {...register("role")}>
              <option value="0">Client</option>
              <option value="1">Client (Muted)</option>
              <option value="2">Router</option>
              <option value="3">Router + Client</option>
              <option value="4">Repeater</option>
              <option value="5">Tracker</option>
              <option value="6">Sensor</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="checkbox"
            text="Serial Enabled"
            error={errors.serialEnabled?.message}
            {...register("serialEnabled")}
          />

          <ConfigInput
            type="checkbox"
            text="Serial Debug Enabled"
            error={errors.debugLogEnabled?.message}
            {...register("debugLogEnabled")}
          />

          {/* TODO BUTTON GPIO */}
          {/* TODO BUZZER GPIO */}

          <ConfigLabel
            text="Rebroadcast Mode"
            error={errors.rebroadcastMode?.message}
          >
            <select {...register("rebroadcastMode")}>
              <option value="0">All</option>
              <option value="1">All, skip decoding (repeater only)</option>
              <option value="2">Local Only (Ignores foreign messages)</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="number"
            text="Node Info Broadcast Interval (seconds)"
            error={errors.nodeInfoBroadcastSecs?.message}
            {...register("nodeInfoBroadcastSecs")}
          />

          <ConfigInput
            type="checkbox"
            text="Double Tap as Button Press"
            error={errors.doubleTapAsButtonPress?.message}
            {...register("doubleTapAsButtonPress")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default DeviceConfigPage;
