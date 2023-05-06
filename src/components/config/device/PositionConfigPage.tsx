import React, { useMemo, useState } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_config_PositionConfig } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IPositionConfigPageProps {
  className?: string;
}

type PositionConfigInput = app_protobufs_config_PositionConfig;

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parsePositionConfigInput = (
  d: PositionConfigInput
): PositionConfigInput => ({
  ...d,
  positionBroadcastSecs: parseInt(d.positionBroadcastSecs as unknown as string),
  gpsUpdateInterval: parseInt(d.gpsUpdateInterval as unknown as string),
  gpsAttemptTime: parseInt(d.gpsAttemptTime as unknown as string),
  // positionFlags: parseInt(d.positionFlags as unknown as string),
  rxGpio: parseInt(d.rxGpio as unknown as string),
  txGpio: parseInt(d.txGpio as unknown as string),
  broadcastSmartMinimumDistance: parseInt(
    d.broadcastSmartMinimumDistance as unknown as string
  ),
  broadcastSmartMinimumIntervalSecs: parseInt(
    d.broadcastSmartMinimumIntervalSecs as unknown as string
  ),
});

const PositionConfigPage = ({ className = "" }: IPositionConfigPageProps) => {
  const device = useSelector(selectDevice());

  const [gpsDisabled, setGpsDisabled] = useState(
    !device?.config.position?.gpsEnabled ?? true
  );

  const [fixedPositionDisabled, setFixedPositionDisabled] = useState(
    !device?.config.position?.fixedPosition ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PositionConfigInput>({
    defaultValues: device?.config.position ?? undefined,
  });

  watch((d) => {
    setGpsDisabled(!d.gpsEnabled);
    setFixedPositionDisabled(!d.fixedPosition);
  });

  const onValidSubmit: SubmitHandler<PositionConfigInput> = (d) => {
    const data = parsePositionConfigInput(d);
    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<PositionConfigInput> = (errors) => {
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
        title={"Position Configuration"}
        subtitle={"Configure device Position settings"}
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
            text="GPS Enabled"
            error={errors.gpsEnabled?.message}
            {...register("gpsEnabled")}
          />

          <ConfigInput
            disabled={gpsDisabled}
            type="number"
            text="Position Broadcast Interval (seconds, 0 = 15m)"
            error={errors.positionBroadcastSecs?.message}
            {...register("positionBroadcastSecs")}
          />

          <ConfigInput
            type="checkbox"
            text="Fixed Position"
            error={errors.fixedPosition?.message}
            {...register("fixedPosition")}
          />

          {/* TODO FIXED LAT */}
          {/* TODO FIXED LON */}

          <ConfigInput
            disabled={gpsDisabled || !fixedPositionDisabled}
            type="number"
            text="GPS Update Interval (seconds, 0 = 30s)"
            error={errors.gpsUpdateInterval?.message}
            {...register("gpsUpdateInterval")}
          />

          <ConfigInput
            disabled={gpsDisabled || !fixedPositionDisabled}
            type="number"
            text="GPS Attempt Time (seconds, 0 = 30s)"
            error={errors.gpsAttemptTime?.message}
            {...register("gpsAttemptTime")}
          />

          <ConfigInput
            disabled={gpsDisabled || !fixedPositionDisabled}
            type="checkbox"
            text="Enable Smart Position Broadcast"
            error={errors.positionBroadcastSmartEnabled?.message}
            {...register("positionBroadcastSmartEnabled")}
          />

          {/* TODO RX GPIO */}
          {/* TODO TX GPIO */}

          {/* TODO SMART MIN DISTANCE */}
          {/* TODO SMART MIN INTERVAL */}
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default PositionConfigPage;
