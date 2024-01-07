import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DeepPartial, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import debounce from "lodash.debounce";

// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import ConfigTitlebar from "@components/config/ConfigTitlebar";

import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/selectors";
import {
  PositionConfigInput,
  configSliceActions,
} from "@features/config/slice";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IPositionConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parsePositionConfigInput = (
  d: DeepPartial<PositionConfigInput>,
): DeepPartial<PositionConfigInput> => ({
  ...d,
  positionBroadcastSecs: parseInt(d.positionBroadcastSecs as unknown as string),
  gpsUpdateInterval: parseInt(d.gpsUpdateInterval as unknown as string),
  gpsAttemptTime: parseInt(d.gpsAttemptTime as unknown as string),
  // positionFlags: parseInt(d.positionFlags as unknown as string),
  rxGpio: parseInt(d.rxGpio as unknown as string),
  txGpio: parseInt(d.txGpio as unknown as string),
  broadcastSmartMinimumDistance: parseInt(
    d.broadcastSmartMinimumDistance as unknown as string,
  ),
  broadcastSmartMinimumIntervalSecs: parseInt(
    d.broadcastSmartMinimumIntervalSecs as unknown as string,
  ),
});

const PositionConfigPage = ({ className = "" }: IPositionConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const [gpsDisabled, setGpsDisabled] = useState(
    !device?.config.position?.gpsEnabled ?? true,
  );

  const [fixedPositionDisabled, setFixedPositionDisabled] = useState(
    !device?.config.position?.fixedPosition ?? true,
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.position ?? undefined,
        editedConfig.position ?? undefined,
      ),
    [],
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

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<PositionConfigInput>) => {
          const data = parsePositionConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateRadioConfig({ position: data }));
        },
        500,
        { leading: true },
      ),
    [],
  );

  useEffect(() => {
    return () => updateConfigHander.cancel();
  }, []);

  watch(updateConfigHander);

  const handleFormReset = () => {
    if (!currentConfig?.position) return;
    reset(currentConfig.position);
    dispatch(configSliceActions.updateRadioConfig({ position: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.radio.position.title")}
        subtitle={t("config.radio.position.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.radio.position.gpsEnabled")}
            error={errors.gpsEnabled?.message as string}
            {...register("gpsEnabled")}
          />

          <ConfigInput
            disabled={gpsDisabled}
            type="number"
            text={t("config.radio.position.posBroadcastInterval")}
            error={errors.positionBroadcastSecs?.message as string}
            {...register("positionBroadcastSecs")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.radio.position.fixedPosition")}
            error={errors.fixedPosition?.message as string}
            {...register("fixedPosition")}
          />

          {/* TODO FIXED LAT */}
          {/* TODO FIXED LON */}

          <ConfigInput
            disabled={gpsDisabled || !fixedPositionDisabled}
            type="number"
            text={t("config.radio.position.gpsUpdateInterval")}
            error={errors.gpsUpdateInterval?.message as string}
            {...register("gpsUpdateInterval")}
          />

          <ConfigInput
            disabled={gpsDisabled || !fixedPositionDisabled}
            type="number"
            text={t("config.radio.position.gpsAttemptTime")}
            error={errors.gpsAttemptTime?.message as string}
            {...register("gpsAttemptTime")}
          />

          <ConfigInput
            disabled={gpsDisabled || !fixedPositionDisabled}
            type="checkbox"
            text={t("config.radio.position.enableSmartPosBroadcast")}
            error={errors.positionBroadcastSmartEnabled?.message as string}
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
