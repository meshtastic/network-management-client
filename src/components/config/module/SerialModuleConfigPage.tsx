import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigInput from "@components/config/ConfigInput";
import ConfigSelect from "@components/config/ConfigSelect";

import {
  SerialModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface ISerialModuleConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseSerialModuleConfigInput = (
  d: DeepPartial<SerialModuleConfigInput>
): DeepPartial<SerialModuleConfigInput> => ({
  ...d,
  mode: parseInt(d.mode as unknown as string),
  rxd: parseInt(d.rxd as unknown as string),
  txd: parseInt(d.txd as unknown as string),
  baud: parseInt(d.baud as unknown as string),
  timeout: parseInt(d.timeout as unknown as string),
});

const SerialModuleConfigPage = ({
  className = "",
}: ISerialModuleConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.serial?.enabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.serial ?? undefined,
        editedConfig.serial ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<SerialModuleConfigInput>) => {
    setModuleDisabled(!d.enabled);
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
  } = useForm<SerialModuleConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<SerialModuleConfigInput>) => {
          const data = parseSerialModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateModuleConfig({ serial: data }));
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
    if (!currentConfig?.serial) return;
    reset(currentConfig.serial);
    dispatch(configSliceActions.updateModuleConfig({ serial: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.serial.title")}
        subtitle={t("config.module.serial.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.module.serial.serialModuleEnabled")}
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.serial.echoSentPackets")}
            disabled={moduleDisabled}
            error={errors.echo?.message}
            {...register("echo")}
          />

          <ConfigSelect
            text={t("config.module.serial.operatingMode.title")}
            disabled={moduleDisabled}
            {...register("mode")}
          >
            <option value="0">
              {t("config.module.serial.operatingMode.default")}
            </option>
            <option value="1">
              {t("config.module.serial.operatingMode.simple")}
            </option>
            <option value="2">
              {t("config.module.serial.operatingMode.protobuf")}
            </option>
            <option value="3">
              {t("config.module.serial.operatingMode.text")}
            </option>
            <option value="4">
              {t("config.module.serial.operatingMode.nmea")}
            </option>
          </ConfigSelect>

          <ConfigInput
            type="number"
            text={t("config.module.serial.rxPin")}
            disabled={moduleDisabled}
            error={errors.rxd?.message}
            {...register("rxd")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.serial.txPin")}
            disabled={moduleDisabled}
            error={errors.txd?.message}
            {...register("txd")}
          />

          <ConfigSelect
            text={t("config.module.serial.baudRate.title")}
            disabled={moduleDisabled}
            {...register("baud")}
          >
            <option value="0">
              {t("config.module.serial.baudRate.default")}
            </option>
            <option value="1">110 bps</option>
            <option value="2">300 bps</option>
            <option value="3">600 bps</option>
            <option value="4">1200 bps</option>
            <option value="5">2400 bps</option>
            <option value="6">4800 bps</option>
            <option value="7">9600 bps</option>
            <option value="8">14400 bps</option>
            <option value="9">19200 bps</option>
            <option value="10">38400 bps</option>
            <option value="11">57600 bps</option>
            <option value="12">115200 bps</option>
            <option value="13">230400 bps</option>
            <option value="14">460800 bps</option>
            <option value="15">576000 bps</option>
            <option value="16">921600 bps</option>
          </ConfigSelect>

          <ConfigInput
            type="number"
            text={t("config.module.serial.serialTimeout")}
            disabled={moduleDisabled}
            error={errors.timeout?.message}
            {...register("timeout")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default SerialModuleConfigPage;
