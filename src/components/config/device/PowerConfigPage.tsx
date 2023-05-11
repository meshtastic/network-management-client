import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  PowerConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IPowerConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parsePowerConfigInput = (
  d: DeepPartial<PowerConfigInput>
): DeepPartial<PowerConfigInput> => ({
  ...d,
  onBatteryShutdownAfterSecs: parseInt(
    d.onBatteryShutdownAfterSecs as unknown as string
  ),
  adcMultiplierOverride: parseFloat(
    d.adcMultiplierOverride as unknown as string
  ),
  waitBluetoothSecs: parseInt(d.waitBluetoothSecs as unknown as string),
  meshSdsTimeoutSecs: parseInt(d.meshSdsTimeoutSecs as unknown as string),
  sdsSecs: parseInt(d.sdsSecs as unknown as string),
  lsSecs: parseInt(d.lsSecs as unknown as string),
  minWakeSecs: parseInt(d.minWakeSecs as unknown as string),
});

const PowerConfigPage = ({ className = "" }: IPowerConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.power ?? undefined,
        editedConfig.power ?? undefined
      ),
    []
  );

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<PowerConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<PowerConfigInput>) => {
          const data = parsePowerConfigInput(d);
          dispatch(configSliceActions.updateRadioConfig({ power: data }));
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
    if (!currentConfig?.power) return;
    reset(currentConfig.power);
    dispatch(configSliceActions.updateRadioConfig({ power: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Power Configuration"}
        subtitle={"Configure device power settings"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text="Enable Power Saving"
            error={errors.isPowerSaving?.message}
            {...register("isPowerSaving")}
          />

          <ConfigInput
            type="number"
            text="Shutdown After Power Loss (seconds, 0 = disabled)"
            error={errors.onBatteryShutdownAfterSecs?.message}
            {...register("onBatteryShutdownAfterSecs")}
          />

          <ConfigInput
            type="number"
            text="ADC Multiplier Override"
            error={errors.adcMultiplierOverride?.message}
            {...register("adcMultiplierOverride")}
          />

          <ConfigInput
            type="number"
            text="Bluetooth Timeout (seconds, 0 = 1min)"
            error={errors.waitBluetoothSecs?.message}
            {...register("waitBluetoothSecs")}
          />

          <ConfigInput
            type="number"
            text="Mesh Super Deep Sleep Timeout (seconds, 0 = 2hrs, MAX_UINT = disabled)"
            error={errors.meshSdsTimeoutSecs?.message}
            {...register("meshSdsTimeoutSecs")}
          />

          <ConfigInput
            type="number"
            text="Super Deep Sleep Interval (seconds, 0 = 1yr, MAX_UINT = disabled)"
            error={errors.sdsSecs?.message}
            {...register("sdsSecs")}
          />

          <ConfigInput
            type="number"
            text="Light Sleep Interval (seconds, 0 = 5min, ESP32 only)"
            error={errors.lsSecs?.message}
            {...register("lsSecs")}
          />

          <ConfigInput
            type="number"
            text="Minimum Wake Interval (seconds, 0 = 10s)"
            error={errors.minWakeSecs?.message}
            {...register("minWakeSecs")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default PowerConfigPage;
