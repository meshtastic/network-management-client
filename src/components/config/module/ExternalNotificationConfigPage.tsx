import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DeepPartial, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import debounce from "lodash.debounce";

// import ConfigLabel from "@components/config/ConfigLabel";
import { ConfigInput } from "@components/config/ConfigInput";
import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";
import {
  ExternalNotificationModuleConfigInput,
  configSliceActions,
} from "@features/config/slice";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IExternalNotificationConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseExternalNotificationModuleConfigInput = (
  d: DeepPartial<ExternalNotificationModuleConfigInput>,
): DeepPartial<ExternalNotificationModuleConfigInput> => ({
  ...d,
  outputMs: parseInt(d.outputMs as unknown as string),
  output: parseInt(d.output as unknown as string),
  outputVibra: parseInt(d.outputVibra as unknown as string),
  outputBuzzer: parseInt(d.outputBuzzer as unknown as string),
  nagTimeout: parseInt(d.nagTimeout as unknown as string),
});

export const ExternalNotificationConfigPage = ({
  className = "",
}: IExternalNotificationConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.externalNotification?.enabled ?? true,
  );

  const [bellAlertsDisabled, setBellAlertsDisabled] = useState(
    !device?.moduleConfig.externalNotification?.alertBell ?? true,
  );

  const [messageAlertsDisabled, setMessageAlertsDisabled] = useState(
    !device?.moduleConfig.externalNotification?.alertMessage ?? true,
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.externalNotification ?? undefined,
        editedConfig.externalNotification ?? undefined,
      ),
    [device, editedConfig],
  );

  const updateStateFlags = (
    d: DeepPartial<ExternalNotificationModuleConfigInput>,
  ) => {
    setModuleDisabled(!d.enabled);
    setBellAlertsDisabled(!d.alertBell);
    setMessageAlertsDisabled(!d.alertMessage);
  };

  useEffect(() => {
    if (!defaultValues) return;
    updateStateFlags(defaultValues);
  }, [defaultValues, updateStateFlags]);

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExternalNotificationModuleConfigInput>({
    defaultValues: device?.moduleConfig.externalNotification ?? undefined,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<ExternalNotificationModuleConfigInput>) => {
          const data = parseExternalNotificationModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(
            configSliceActions.updateModuleConfig({
              externalNotification: data,
            }),
          );
        },
        500,
        { leading: true },
      ),
    [dispatch, updateStateFlags],
  );

  watch(updateConfigHander);

  // Cancel handlers when unmounting
  useEffect(() => {
    return () => updateConfigHander.cancel();
  }, [updateConfigHander]);

  const handleFormReset = () => {
    if (!currentConfig?.externalNotification) return;
    reset(currentConfig.externalNotification);
    dispatch(
      configSliceActions.updateModuleConfig({ externalNotification: null }),
    );
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.externalNotification.title")}
        subtitle={t("config.module.externalNotification.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.module.externalNotification.extNotEnabled")}
            error={errors.enabled?.message as string}
            {...register("enabled")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.externalNotification.activeHighLed")}
            disabled={moduleDisabled}
            error={errors.active?.message as string}
            {...register("active")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.externalNotification.enableBellAlerts")}
            disabled={moduleDisabled}
            error={errors.alertBell?.message as string}
            {...register("alertBell")}
          />

          <ConfigInput
            type="checkbox"
            text={t(
              "config.module.externalNotification.enableBellVibrateAlert",
            )}
            disabled={moduleDisabled || bellAlertsDisabled}
            error={errors.alertBellVibra?.message as string}
            {...register("alertBellVibra")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.externalNotification.enableBellBuzzerAlert")}
            disabled={moduleDisabled || bellAlertsDisabled}
            error={errors.alertBellBuzzer?.message as string}
            {...register("alertBellBuzzer")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.externalNotification.enableMessageAlerts")}
            disabled={moduleDisabled}
            error={errors.alertMessage?.message as string}
            {...register("alertMessage")}
          />

          <ConfigInput
            type="checkbox"
            text={t(
              "config.module.externalNotification.enableMessageVibrateAlert",
            )}
            disabled={moduleDisabled || messageAlertsDisabled}
            error={errors.alertMessageVibra?.message as string}
            {...register("alertMessageVibra")}
          />

          <ConfigInput
            type="checkbox"
            text={t(
              "config.module.externalNotification.enableMessageBuzzerAlert",
            )}
            disabled={moduleDisabled || messageAlertsDisabled}
            error={errors.alertMessageBuzzer?.message as string}
            {...register("alertMessageBuzzer")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.externalNotification.alertLedPin")}
            disabled={moduleDisabled}
            error={errors.output?.message as string}
            {...register("output")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.externalNotification.alertVibratePin")}
            disabled={moduleDisabled}
            error={errors.outputVibra?.message as string}
            {...register("outputVibra")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.externalNotification.alertBuzzerPin")}
            disabled={moduleDisabled}
            error={errors.outputBuzzer?.message as string}
            {...register("outputBuzzer")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.externalNotification.enableBuzzerPwm")}
            disabled={moduleDisabled}
            error={errors.usePwm?.message as string}
            {...register("usePwm")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.externalNotification.alertDuration")}
            disabled={moduleDisabled}
            error={errors.outputMs?.message as string}
            {...register("outputMs")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.externalNotification.alertNagDuration")}
            disabled={moduleDisabled}
            error={errors.nagTimeout?.message as string}
            {...register("nagTimeout")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};
