import React, { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_config_PowerConfig } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IPowerConfigPageProps {
  className?: string;
}

type PowerConfigInput = app_protobufs_config_PowerConfig;

const PowerConfigPage = ({ className = "" }: IPowerConfigPageProps) => {
  const device = useSelector(selectDevice());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PowerConfigInput>({
    defaultValues: device?.config.power ?? undefined,
  });

  const onValidSubmit: SubmitHandler<PowerConfigInput> = (d) => {
    // See https://github.com/react-hook-form/react-hook-form/issues/10378
    const data: PowerConfigInput = {
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
    };

    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<PowerConfigInput> = (errors) => {
    console.warn("errors", errors);
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    handleSubmit(onValidSubmit, onInvalidSubmit)(e).catch(console.error);
  };

  const formId = useMemo(() => v4(), []);

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Power Configuration"}
        subtitle={"Configure device power settings"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        buttonProps={{ type: "submit", form: formId }}
      >
        <form
          className="flex flex-col gap-6"
          id={formId}
          onSubmit={handleFormSubmit}
        >
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
            text="Enable Super Deep Sleep (seconds, 0 = 2hrs)"
            error={errors.meshSdsTimeoutSecs?.message}
            {...register("meshSdsTimeoutSecs")}
          />

          <ConfigInput
            type="number"
            text="Enable Super Deep Sleep (seconds, 0 = 2hrs)"
            error={errors.meshSdsTimeoutSecs?.message}
            {...register("meshSdsTimeoutSecs")}
          />

          <ConfigInput
            type="number"
            text="Light Sleep Interval (seconds, 0 = 5min, ESP32 only)"
            error={errors.lsSecs?.message}
            {...register("lsSecs")}
          />

          <ConfigInput
            type="number"
            text="Light Sleep Wake Interval (seconds, 0 = 10s)"
            error={errors.lsSecs?.message}
            {...register("lsSecs")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default PowerConfigPage;
