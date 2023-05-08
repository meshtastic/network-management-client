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
  MQTTModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IMQTTConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseMQTTModuleConfigInput = (
  d: MQTTModuleConfigInput
): MQTTModuleConfigInput => ({
  ...d,
});

const MQTTConfigPage = ({ className = "" }: IMQTTConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.mqtt?.enabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MQTTModuleConfigInput>({
    defaultValues: device?.moduleConfig.mqtt ?? undefined,
  });

  watch((d) => {
    setModuleDisabled(!d.enabled);
  });

  const onValidSubmit: SubmitHandler<MQTTModuleConfigInput> = (d) => {
    const data = parseMQTTModuleConfigInput(d);
    dispatch(configSliceActions.updateModuleConfig({ mqtt: data }));
  };

  const onInvalidSubmit: SubmitErrorHandler<MQTTModuleConfigInput> = (
    errors
  ) => {
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
        title={"MQTT Configuration"}
        subtitle={"Configure MQTT"}
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
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default MQTTConfigPage;
