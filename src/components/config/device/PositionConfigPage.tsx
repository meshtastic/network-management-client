import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  PositionConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IPositionConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parsePositionConfigInput = (
  d: DeepPartial<PositionConfigInput>
): DeepPartial<PositionConfigInput> => ({
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
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const [gpsDisabled, setGpsDisabled] = useState(
    !device?.config.position?.gpsEnabled ?? true
  );

  const [fixedPositionDisabled, setFixedPositionDisabled] = useState(
    !device?.config.position?.fixedPosition ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.position ?? undefined,
        editedConfig.position ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<PositionConfigInput>) => {
    setGpsDisabled(!d.gpsEnabled);
    setFixedPositionDisabled(!d.fixedPosition);
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
  } = useForm<PositionConfigInput>({
    defaultValues,
  });

  watch((d) => {
    const data = parsePositionConfigInput(d);
    updateStateFlags(data);
    dispatch(configSliceActions.updateRadioConfig({ position: data }));
  });

  const handleFormReset = () => {
    if (!currentConfig?.position) return;
    reset(currentConfig.position);
    dispatch(configSliceActions.updateRadioConfig({ position: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Position Configuration"}
        subtitle={"Configure device Position settings"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
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
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default PositionConfigPage;
