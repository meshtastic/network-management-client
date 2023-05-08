import React, { useMemo, useState } from "react";
import type { FormEventHandler } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  TelemetryModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import { selectDevice } from "@features/device/deviceSelectors";

export interface ITelemetryConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseTelemetryModuleConfigInput = (
  d: TelemetryModuleConfigInput
): TelemetryModuleConfigInput => ({
  ...d,
  deviceUpdateInterval: parseInt(d.deviceUpdateInterval as unknown as string),
  environmentUpdateInterval: parseInt(
    d.environmentUpdateInterval as unknown as string
  ),
  airQualityInterval: parseInt(d.airQualityInterval as unknown as string),
});

const TelemetryConfigPage = ({ className = "" }: ITelemetryConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const [airQualityDisabled, setAirQualityDisabled] = useState(
    !device?.moduleConfig.telemetry?.airQualityEnabled ?? true
  );

  const [envMeasurementDisabled, setEnvMeasurementDisabled] = useState(
    !device?.moduleConfig.telemetry?.environmentMeasurementEnabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TelemetryModuleConfigInput>({
    defaultValues: device?.moduleConfig.telemetry ?? undefined,
  });

  watch((d) => {
    setAirQualityDisabled(!d.airQualityEnabled);
    setEnvMeasurementDisabled(!d.environmentMeasurementEnabled);
  });

  const onValidSubmit: SubmitHandler<TelemetryModuleConfigInput> = (d) => {
    const data = parseTelemetryModuleConfigInput(d);
    dispatch(configSliceActions.updateModuleConfig({ telemetry: data }));
  };

  const onInvalidSubmit: SubmitErrorHandler<TelemetryModuleConfigInput> = (
    errors
  ) => {
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
        title={"Telemetry Configuration"}
        subtitle={"Configure Telemetry"}
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
            type="number"
            text="Device Metrics Interval (sec)"
            error={errors.deviceUpdateInterval?.message}
            {...register("deviceUpdateInterval")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Air Quality Measurements"
            error={errors.airQualityEnabled?.message}
            {...register("airQualityEnabled")}
          />

          <ConfigInput
            type="number"
            text="Air Quality Update Interval (sec)"
            disabled={airQualityDisabled}
            error={errors.airQualityInterval?.message}
            {...register("airQualityInterval")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Environment Measurements"
            error={errors.environmentMeasurementEnabled?.message}
            {...register("environmentMeasurementEnabled")}
          />

          <ConfigInput
            type="number"
            text="Environment Update Interval (sec)"
            disabled={envMeasurementDisabled}
            error={errors.environmentUpdateInterval?.message}
            {...register("environmentUpdateInterval")}
          />

          <ConfigInput
            type="checkbox"
            text="Use Fahrenheit for Environment Measurementss"
            disabled={envMeasurementDisabled}
            error={errors.environmentDisplayFahrenheit?.message}
            {...register("environmentDisplayFahrenheit")}
          />

          <ConfigInput
            type="checkbox"
            text="Show Environment Measurements on Device Screen"
            disabled={envMeasurementDisabled}
            error={errors.environmentScreenEnabled?.message}
            {...register("environmentScreenEnabled")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default TelemetryConfigPage;
