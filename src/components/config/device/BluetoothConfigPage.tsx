import React, { useMemo, useState } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_config_BluetoothConfig } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IBluetoothConfigPageProps {
  className?: string;
}

type BluetoothConfigInput = app_protobufs_config_BluetoothConfig;

const BluetoothConfigPage = ({ className = "" }: IBluetoothConfigPageProps) => {
  const device = useSelector(selectDevice());

  const [bluetoothDisabled, setBluetoothDisabled] = useState(
    !device?.config.bluetooth?.enabled ?? true
  );

  const [fixedPinDisabled, setFixedPinDisabled] = useState(
    device?.config.bluetooth?.mode != 1 ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BluetoothConfigInput>({
    defaultValues: device?.config.bluetooth ?? undefined,
  });

  watch((d) => {
    setBluetoothDisabled(!d.enabled);
    setFixedPinDisabled(d.mode == 1);
  });

  const onValidSubmit: SubmitHandler<BluetoothConfigInput> = (d) => {
    // See https://github.com/react-hook-form/react-hook-form/issues/10378
    const data: BluetoothConfigInput = {
      ...d,
      fixedPin: parseInt(d.fixedPin as unknown as string),
      mode: parseInt(d.mode as unknown as string),
    };

    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<BluetoothConfigInput> = (
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
        title={"Bluetooth Configuration"}
        subtitle={"Configure device bluetooth connection"}
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
            text="Bluetooth Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigLabel text="Pairing Mode" error={errors.mode?.message}>
            <select disabled={bluetoothDisabled} {...register("mode")}>
              <option value="0">Random Pin</option>
              <option value="1">Fixed Pin</option>
              <option value="2">No Pin</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="number"
            text="Fixed Pin (if enabled)"
            disabled={bluetoothDisabled || fixedPinDisabled}
            error={errors.fixedPin?.message}
            {...register("fixedPin")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default BluetoothConfigPage;
