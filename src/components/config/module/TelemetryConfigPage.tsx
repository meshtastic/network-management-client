import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  TelemetryModuleConfigInput,
  configSliceActions,
} from "@features/config/slice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface ITelemetryConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseTelemetryModuleConfigInput = (
  d: DeepPartial<TelemetryModuleConfigInput>
): DeepPartial<TelemetryModuleConfigInput> => ({
  ...d,
  deviceUpdateInterval: parseInt(d.deviceUpdateInterval as unknown as string),
  environmentUpdateInterval: parseInt(
    d.environmentUpdateInterval as unknown as string
  ),
  airQualityInterval: parseInt(d.airQualityInterval as unknown as string),
});

const TelemetryConfigPage = ({ className = "" }: ITelemetryConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [airQualityDisabled, setAirQualityDisabled] = useState(
    !device?.moduleConfig.telemetry?.airQualityEnabled ?? true
  );

  const [envMeasurementDisabled, setEnvMeasurementDisabled] = useState(
    !device?.moduleConfig.telemetry?.environmentMeasurementEnabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.telemetry ?? undefined,
        editedConfig.telemetry ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<TelemetryModuleConfigInput>) => {
    setAirQualityDisabled(!d.airQualityEnabled);
    setEnvMeasurementDisabled(!d.environmentMeasurementEnabled);
  };

  useEffect(() => {
    if (!defaultValues) return;
    updateStateFlags(defaultValues);
  }, [defaultValues]);

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<TelemetryModuleConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<TelemetryModuleConfigInput>) => {
          const data = parseTelemetryModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateModuleConfig({ telemetry: data }));
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
    if (!currentConfig?.telemetry) return;
    reset(currentConfig.telemetry);
    dispatch(configSliceActions.updateModuleConfig({ telemetry: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.telemetry.title")}
        subtitle={t("config.module.telemetry.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="number"
            text={t("config.module.telemetry.deviceMetricsInterval")}
            error={errors.deviceUpdateInterval?.message}
            {...register("deviceUpdateInterval")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.telemetry.enableAirQualityMetrics")}
            error={errors.airQualityEnabled?.message}
            {...register("airQualityEnabled")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.telemetry.airQualityUpdateInterval")}
            disabled={airQualityDisabled}
            error={errors.airQualityInterval?.message}
            {...register("airQualityInterval")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.telemetry.enableEnvironmentMetrics")}
            error={errors.environmentMeasurementEnabled?.message}
            {...register("environmentMeasurementEnabled")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.telemetry.environmentUpdateInterval")}
            disabled={envMeasurementDisabled}
            error={errors.environmentUpdateInterval?.message}
            {...register("environmentUpdateInterval")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.telemetry.useFahrenheitForEnvMetrics")}
            disabled={envMeasurementDisabled}
            error={errors.environmentDisplayFahrenheit?.message}
            {...register("environmentDisplayFahrenheit")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.telemetry.showEnvMetricsOnDeviceScreen")}
            disabled={envMeasurementDisabled}
            error={errors.environmentScreenEnabled?.message}
            {...register("environmentScreenEnabled")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default TelemetryConfigPage;
