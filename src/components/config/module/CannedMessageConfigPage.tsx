import React, { useMemo, useState } from "react";
import type { FormEventHandler } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  CannedMessageModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import { selectDevice } from "@features/device/deviceSelectors";

export interface ICannedMessageConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseCannedMessageModuleConfigInput = (
  d: CannedMessageModuleConfigInput
): CannedMessageModuleConfigInput => ({
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
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.cannedMessage?.enabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CannedMessageModuleConfigInput>({
    defaultValues: device?.moduleConfig.cannedMessage ?? undefined,
  });

  watch((d) => {
    setModuleDisabled(!d.enabled);
  });

  const onValidSubmit: SubmitHandler<CannedMessageModuleConfigInput> = (d) => {
    const data = parseCannedMessageModuleConfigInput(d);
    dispatch(configSliceActions.updateModuleConfig({ cannedMessage: data }));
  };

  const onInvalidSubmit: SubmitErrorHandler<CannedMessageModuleConfigInput> = (
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
        title={"CannedMessage Configuration"}
        subtitle={"Configure CannedMessage"}
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
            text="Canned Messages Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigLabel
            text="Allow Input Source"
            error={errors.allowInputSource?.message}
          >
            <select disabled={moduleDisabled} {...register("allowInputSource")}>
              <option value="_any">Any Peripheral</option>
              <option value="rotEnc1">3200 bps</option>
              <option value="upDownEnc1">Up / Down Encoder, RAK14006</option>
              <option value="cardkb">M5 Stack CardKB</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="checkbox"
            text="Send Bell"
            disabled={moduleDisabled}
            error={errors.sendBell?.message}
            {...register("sendBell")}
          />

          <ConfigInput
            type="checkbox"
            text="Rotary Encoder Enabled"
            disabled={moduleDisabled}
            error={errors.rotary1Enabled?.message}
            {...register("rotary1Enabled")}
          />

          <ConfigInput
            type="checkbox"
            text="Up / Down Encoder Enabled"
            disabled={moduleDisabled}
            error={errors.updown1Enabled?.message}
            {...register("updown1Enabled")}
          />

          <ConfigInput
            type="number"
            text="Input Broker Pin A"
            disabled={moduleDisabled}
            error={errors.inputbrokerPinA?.message}
            {...register("inputbrokerPinA")}
          />

          <ConfigInput
            type="number"
            text="Input Broker Pin B"
            disabled={moduleDisabled}
            error={errors.inputbrokerPinB?.message}
            {...register("inputbrokerPinB")}
          />

          <ConfigInput
            type="number"
            text="Input Broker Press Pin"
            disabled={moduleDisabled}
            error={errors.inputbrokerPinPress?.message}
            {...register("inputbrokerPinPress")}
          />

          <ConfigInput
            type="number"
            text="Input Broker Event CW"
            disabled={moduleDisabled}
            error={errors.inputbrokerEventCw?.message}
            {...register("inputbrokerEventCw")}
          />

          <ConfigInput
            type="number"
            text="Input Broker Event CCW"
            disabled={moduleDisabled}
            error={errors.inputbrokerEventCcw?.message}
            {...register("inputbrokerEventCcw")}
          />

          <ConfigInput
            type="number"
            text="Fixed Pin (if enabled)"
            disabled={moduleDisabled}
            error={errors.inputbrokerEventPress?.message}
            {...register("inputbrokerEventPress")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default CannedMessageConfigPage;
