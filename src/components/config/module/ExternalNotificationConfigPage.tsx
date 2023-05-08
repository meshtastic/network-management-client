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
  ExternalNotificationModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IExternalNotificationConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseExternalNotificationModuleConfigInput = (
  d: ExternalNotificationModuleConfigInput
): ExternalNotificationModuleConfigInput => ({
  ...d,
  outputMs: parseInt(d.outputMs as unknown as string),
  output: parseInt(d.output as unknown as string),
  outputVibra: parseInt(d.outputVibra as unknown as string),
  outputBuzzer: parseInt(d.outputBuzzer as unknown as string),
  nagTimeout: parseInt(d.nagTimeout as unknown as string),
});

const ExternalNotificationConfigPage = ({
  className = "",
}: IExternalNotificationConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.externalNotification?.enabled ?? true
  );

  const [bellAlertsDisabled, setBellAlertsDisabled] = useState(
    !device?.moduleConfig.externalNotification?.alertBell ?? true
  );

  const [messageAlertsDisabled, setMessageAlertsDisabled] = useState(
    !device?.moduleConfig.externalNotification?.alertBell ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExternalNotificationModuleConfigInput>({
    defaultValues: device?.moduleConfig.externalNotification ?? undefined,
  });

  watch((d) => {
    setModuleDisabled(!d.enabled);
    setBellAlertsDisabled(!d.alertBell);
    setMessageAlertsDisabled(!d.alertMessage);
  });

  const onValidSubmit: SubmitHandler<ExternalNotificationModuleConfigInput> = (
    d
  ) => {
    const data = parseExternalNotificationModuleConfigInput(d);
    dispatch(
      configSliceActions.updateModuleConfig({ externalNotification: data })
    );
  };

  const onInvalidSubmit: SubmitErrorHandler<
    ExternalNotificationModuleConfigInput
  > = (errors) => {
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
        title={"ExternalNotification Configuration"}
        subtitle={"Configure ExternalNotification"}
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
            text="External Notification Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigInput
            type="checkbox"
            text="Active High LED"
            disabled={moduleDisabled}
            error={errors.active?.message}
            {...register("active")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Bell Alerts"
            disabled={moduleDisabled}
            error={errors.alertBell?.message}
            {...register("alertBell")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Bell Vibrate Alert"
            disabled={moduleDisabled || bellAlertsDisabled}
            error={errors.alertBellVibra?.message}
            {...register("alertBellVibra")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Bell Buzzer Alert"
            disabled={moduleDisabled || bellAlertsDisabled}
            error={errors.alertBellBuzzer?.message}
            {...register("alertBellBuzzer")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Message Alerts"
            disabled={moduleDisabled}
            error={errors.alertMessage?.message}
            {...register("alertMessage")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Message Vibrate Alert"
            disabled={moduleDisabled || messageAlertsDisabled}
            error={errors.alertMessageVibra?.message}
            {...register("alertMessageVibra")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Message Buzzer Alert"
            disabled={moduleDisabled || messageAlertsDisabled}
            error={errors.alertMessageBuzzer?.message}
            {...register("alertMessageBuzzer")}
          />

          <ConfigInput
            type="number"
            text="Alert LED Pin"
            disabled={moduleDisabled}
            error={errors.output?.message}
            {...register("output")}
          />

          <ConfigInput
            type="number"
            text="Alert Vibrate Pin"
            disabled={moduleDisabled}
            error={errors.outputVibra?.message}
            {...register("outputVibra")}
          />

          <ConfigInput
            type="number"
            text="Alert Buzzer Pin"
            disabled={moduleDisabled}
            error={errors.outputBuzzer?.message}
            {...register("outputBuzzer")}
          />

          <ConfigInput
            type="checkbox"
            text="Enable Buzzer PWM"
            disabled={moduleDisabled}
            error={errors.usePwm?.message}
            {...register("usePwm")}
          />

          <ConfigInput
            type="number"
            text="Alert Duration (0 = 1000ms)"
            disabled={moduleDisabled}
            error={errors.outputMs?.message}
            {...register("outputMs")}
          />

          <ConfigInput
            type="number"
            text="Alert Nag Duration (0 = off)"
            disabled={moduleDisabled}
            error={errors.nagTimeout?.message}
            {...register("nagTimeout")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default ExternalNotificationConfigPage;
