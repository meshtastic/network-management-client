import React, { useEffect, useMemo, useState } from "react";
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
} from "@features/config/configSlice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IMQTTConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseMQTTModuleConfigInput = (
  d: DeepPartial<MQTTModuleConfigInput>
): DeepPartial<MQTTModuleConfigInput> => ({
  ...d,
});

const MQTTConfigPage = ({ className = "" }: IMQTTConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.mqtt?.enabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.mqtt ?? undefined,
        editedConfig.mqtt ?? undefined
      ),
    []
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
        { leading: true }
      ),
    []
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
        title={"MQTT Configuration"}
        subtitle={"Configure MQTT"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text="MQTT Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigInput
            type="text"
            text="Server Address"
            disabled={moduleDisabled}
            error={errors.address?.message}
            {...register("address")}
          />

          <ConfigInput
            type="text"
            text="Username"
            disabled={moduleDisabled}
            error={errors.username?.message}
            {...register("username")}
          />

          <ConfigInput
            type="password"
            text="Password"
            disabled={moduleDisabled}
            error={errors.password?.message}
            {...register("password")}
          />

          <ConfigInput
            type="checkbox"
            text="Encryption Enabled"
            disabled={moduleDisabled}
            error={errors.encryptionEnabled?.message}
            {...register("encryptionEnabled")}
          />

          <ConfigInput
            type="checkbox"
            text="JSON Enabled"
            disabled={moduleDisabled}
            error={errors.jsonEnabled?.message}
            {...register("jsonEnabled")}
          />

          <ConfigInput
            type="checkbox"
            text="TLS Enabled"
            disabled={moduleDisabled}
            error={errors.tlsEnabled?.message}
            {...register("tlsEnabled")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default MQTTConfigPage;
