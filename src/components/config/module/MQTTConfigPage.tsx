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
  MQTTModuleConfigInput,
  configSliceActions,
} from "@features/config/slice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IMQTTConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseMQTTModuleConfigInput = (
  d: DeepPartial<MQTTModuleConfigInput>,
): DeepPartial<MQTTModuleConfigInput> => ({
  ...d,
});

const MQTTConfigPage = ({ className = "" }: IMQTTConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.mqtt?.enabled ?? true,
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.mqtt ?? undefined,
        editedConfig.mqtt ?? undefined,
      ),
    [],
  );

  const updateStateFlags = (d: DeepPartial<MQTTModuleConfigInput>) => {
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
  } = useForm<MQTTModuleConfigInput>({
    defaultValues: device?.moduleConfig.mqtt ?? undefined,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<MQTTModuleConfigInput>) => {
          const data = parseMQTTModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateModuleConfig({ mqtt: data }));
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
    if (!currentConfig?.mqtt) return;
    reset(currentConfig.mqtt);
    dispatch(configSliceActions.updateModuleConfig({ mqtt: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.mqtt.title")}
        subtitle={t("config.module.mqtt.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.module.mqtt.enableMqtt")}
            error={errors.enabled?.message as string}
            {...register("enabled")}
          />

          <ConfigInput
            type="text"
            text={t("config.module.mqtt.serverAddress")}
            disabled={moduleDisabled}
            error={errors.address?.message as string}
            {...register("address")}
          />

          <ConfigInput
            type="text"
            text={t("config.module.mqtt.username")}
            disabled={moduleDisabled}
            error={errors.username?.message as string}
            {...register("username")}
          />

          <ConfigInput
            type="password"
            text={t("config.module.mqtt.password")}
            disabled={moduleDisabled}
            error={errors.password?.message as string}
            {...register("password")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.mqtt.encryptionEnabled")}
            disabled={moduleDisabled}
            error={errors.encryptionEnabled?.message as string}
            {...register("encryptionEnabled")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.mqtt.jsonEnabled")}
            disabled={moduleDisabled}
            error={errors.jsonEnabled?.message as string}
            {...register("jsonEnabled")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.mqtt.tlsEnabled")}
            disabled={moduleDisabled}
            error={errors.tlsEnabled?.message as string}
            {...register("tlsEnabled")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default MQTTConfigPage;
