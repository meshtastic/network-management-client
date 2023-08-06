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
  CannedMessageModuleConfigInput,
  configSliceActions,
} from "@features/config/slice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface ICannedMessageConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseCannedMessageModuleConfigInput = (
  d: DeepPartial<CannedMessageModuleConfigInput>
): DeepPartial<CannedMessageModuleConfigInput> => ({
  ...d,
  inputbrokerPinA: parseInt(d.inputbrokerPinA as unknown as string),
  inputbrokerPinB: parseInt(d.inputbrokerPinB as unknown as string),
  inputbrokerPinPress: parseInt(d.inputbrokerPinPress as unknown as string),
  inputbrokerEventCw: parseInt(d.inputbrokerEventCw as unknown as string),
  inputbrokerEventCcw: parseInt(d.inputbrokerEventCcw as unknown as string),
  inputbrokerEventPress: parseInt(d.inputbrokerEventPress as unknown as string),
});

const CannedMessageConfigPage = ({
  className = "",
}: ICannedMessageConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.cannedMessage?.enabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.cannedMessage ?? undefined,
        editedConfig.cannedMessage ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<CannedMessageModuleConfigInput>) => {
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
  } = useForm<CannedMessageModuleConfigInput>({
    defaultValues: device?.moduleConfig.cannedMessage ?? undefined,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<CannedMessageModuleConfigInput>) => {
          const data = parseCannedMessageModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(
            configSliceActions.updateModuleConfig({ cannedMessage: data })
          );
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
    if (!currentConfig?.cannedMessage) return;
    reset(currentConfig.cannedMessage);
    dispatch(configSliceActions.updateModuleConfig({ cannedMessage: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.cannedMessages.title")}
        subtitle={t("config.module.cannedMessages.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.module.cannedMessages.cannedMessagesEnabled")}
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigSelect
            text={t("config.module.cannedMessages.allowInputSource.title")}
            disabled={moduleDisabled}
            {...register("allowInputSource")}
          >
            <option value="">
              {t("config.module.cannedMessages.allowInputSource.noSelect")}
            </option>
            <option value="_any">
              {t("config.module.cannedMessages.allowInputSource.any")}
            </option>
            <option value="rotEnc1">
              {t("config.module.cannedMessages.allowInputSource.3200bps")}
            </option>
            <option value="upDownEnc1">
              {t("config.module.cannedMessages.allowInputSource.encoder")}
            </option>
            <option value="cardkb">
              {t("config.module.cannedMessages.allowInputSource.cardKb")}
            </option>
          </ConfigSelect>

          <ConfigInput
            type="checkbox"
            text={t("config.module.cannedMessages.sendBell")}
            disabled={moduleDisabled}
            error={errors.sendBell?.message}
            {...register("sendBell")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.cannedMessages.enableRotaryEncoder")}
            disabled={moduleDisabled}
            error={errors.rotary1Enabled?.message}
            {...register("rotary1Enabled")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.cannedMessages.enableUpDownEncoder")}
            disabled={moduleDisabled}
            error={errors.updown1Enabled?.message}
            {...register("updown1Enabled")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.cannedMessages.brokerA")}
            disabled={moduleDisabled}
            error={errors.inputbrokerPinA?.message}
            {...register("inputbrokerPinA")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.cannedMessages.brokerB")}
            disabled={moduleDisabled}
            error={errors.inputbrokerPinB?.message}
            {...register("inputbrokerPinB")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.cannedMessages.brokerPress")}
            disabled={moduleDisabled}
            error={errors.inputbrokerPinPress?.message}
            {...register("inputbrokerPinPress")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.cannedMessages.brokerEventCw")}
            disabled={moduleDisabled}
            error={errors.inputbrokerEventCw?.message}
            {...register("inputbrokerEventCw")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.cannedMessages.brokerEventCcw")}
            disabled={moduleDisabled}
            error={errors.inputbrokerEventCcw?.message}
            {...register("inputbrokerEventCcw")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.cannedMessages.brokerEventPress")}
            disabled={moduleDisabled}
            error={errors.inputbrokerEventPress?.message}
            {...register("inputbrokerEventPress")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default CannedMessageConfigPage;
