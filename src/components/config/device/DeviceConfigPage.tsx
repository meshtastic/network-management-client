import React, { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_config_DeviceConfig } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IDeviceConfigPageProps {
  className?: string;
}

type DeviceConfigInput = app_protobufs_config_DeviceConfig;

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseDeviceConfigInput = (d: DeviceConfigInput): DeviceConfigInput => ({
  ...d,
  nodeInfoBroadcastSecs: parseInt(d.nodeInfoBroadcastSecs as unknown as string),
  role: parseInt(d.role as unknown as string),
  rebroadcastMode: parseInt(d.rebroadcastMode as unknown as string),
});

const DeviceConfigPage = ({ className = "" }: IDeviceConfigPageProps) => {
  const device = useSelector(selectDevice());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceConfigInput>({
    defaultValues: device?.config.device ?? undefined,
  });

  const onValidSubmit: SubmitHandler<DeviceConfigInput> = (d) => {
    const data = parseDeviceConfigInput(d);
    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<DeviceConfigInput> = (errors) => {
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
        title={"Device Configuration"}
        subtitle={"Configure device"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        buttonProps={{ type: "submit", form: formId }}
      >
        <form
          className="flex flex-col gap-6"
          id={formId}
          onSubmit={handleFormSubmit}
        >
          <ConfigLabel text="Device Role" error={errors.role?.message}>
            <select {...register("role")}>
              <option value="0">Client</option>
              <option value="1">Client (Muted)</option>
              <option value="2">Router</option>
              <option value="3">Router + Client</option>
              <option value="4">Repeater</option>
              <option value="5">Tracker</option>
              <option value="6">Sensor</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="checkbox"
            text="Serial Enabled"
            error={errors.serialEnabled?.message}
            {...register("serialEnabled")}
          />

          <ConfigInput
            type="checkbox"
            text="Serial Debug Enabled"
            error={errors.debugLogEnabled?.message}
            {...register("debugLogEnabled")}
          />

          {/* TODO BUTTON GPIO */}
          {/* TODO BUZZER GPIO */}

          <ConfigLabel
            text="Rebroadcast Mode"
            error={errors.rebroadcastMode?.message}
          >
            <select {...register("rebroadcastMode")}>
              <option value="0">All</option>
              <option value="1">All, skip decoding (repeater only)</option>
              <option value="2">Local Only (Ignores foreign messages)</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="number"
            text="Node Info Broadcast Interval (seconds)"
            error={errors.nodeInfoBroadcastSecs?.message}
            {...register("nodeInfoBroadcastSecs")}
          />

          <ConfigInput
            type="checkbox"
            text="Double Tap as Button Press"
            error={errors.doubleTapAsButtonPress?.message}
            {...register("doubleTapAsButtonPress")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default DeviceConfigPage;
