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
  SerialModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import { selectDevice } from "@features/device/deviceSelectors";

export interface ISerialModuleConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseSerialModuleConfigInput = (
  d: SerialModuleConfigInput
): SerialModuleConfigInput => ({
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
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.serial?.enabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SerialModuleConfigInput>({
    defaultValues: device?.moduleConfig.serial ?? undefined,
  });

  watch((d) => {
    setModuleDisabled(!d.enabled);
  });

  const onValidSubmit: SubmitHandler<SerialModuleConfigInput> = (d) => {
    const data = parseSerialModuleConfigInput(d);
    dispatch(configSliceActions.updateModuleConfig({ serial: data }));
  };

  const onInvalidSubmit: SubmitErrorHandler<SerialModuleConfigInput> = (
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
        title={"SerialModule Configuration"}
        subtitle={"Configure SerialModule"}
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
            text="Serial Module Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigInput
            type="checkbox"
            text="Echo Sent Packets"
            disabled={moduleDisabled}
            error={errors.echo?.message}
            {...register("echo")}
          />

          <ConfigLabel text="Operating Mode" error={errors.mode?.message}>
            <select disabled={moduleDisabled} {...register("mode")}>
              <option value="0">Default</option>
              <option value="1">Simple (UART Tunnel)</option>
              <option value="2">Protobuf Client API</option>
              <option value="3">Text Messages</option>
              <option value="4">NMEA Stream</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="number"
            text="RX Pin (0 = unset)"
            disabled={moduleDisabled}
            error={errors.rxd?.message}
            {...register("rxd")}
          />

          <ConfigInput
            type="number"
            text="TX Pin (0 = unset)"
            disabled={moduleDisabled}
            error={errors.txd?.message}
            {...register("txd")}
          />

          <ConfigLabel text="Baud Rate" error={errors.baud?.message}>
            <select disabled={moduleDisabled} {...register("baud")}>
              <option value="0">Default</option>
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
            </select>
          </ConfigLabel>

          <ConfigInput
            type="number"
            text="Serial Timeout (ms, 0 = 250ms)"
            disabled={moduleDisabled}
            error={errors.timeout?.message}
            {...register("timeout")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default SerialModuleConfigPage;
