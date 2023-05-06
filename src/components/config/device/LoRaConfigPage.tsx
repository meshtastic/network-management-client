import React, { useMemo, useState } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_config_LoRaConfig } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import { selectDevice } from "@features/device/deviceSelectors";

export interface ILoRaConfigPageProps {
  className?: string;
}

type LoRaConfigInput = app_protobufs_config_LoRaConfig;

const LoRaConfigPage = ({ className = "" }: ILoRaConfigPageProps) => {
  const device = useSelector(selectDevice());

  const [useModemPreset, setUseModemPreset] = useState(
    !device?.config.lora?.modemPreset ?? false
  );

  const [txEnabled, setTxEnabled] = useState(
    device?.config.lora?.txEnabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LoRaConfigInput>({
    defaultValues: device?.config.lora ?? undefined,
  });

  watch((d) => {
    setUseModemPreset(!!d.usePreset);
    setTxEnabled(!!d.txEnabled);
  });

  const onValidSubmit: SubmitHandler<LoRaConfigInput> = (d) => {
    // See https://github.com/react-hook-form/react-hook-form/issues/10378
    const data: LoRaConfigInput = {
      ...d,
      region: parseInt(d.region as unknown as string),
      modemPreset: parseInt(d.modemPreset as unknown as string),
      bandwidth: parseInt(d.bandwidth as unknown as string),
      spreadFactor: parseInt(d.spreadFactor as unknown as string),
      codingRate: parseInt(d.codingRate as unknown as string),
      frequencyOffset: parseInt(d.frequencyOffset as unknown as string),
      hopLimit: parseInt(d.hopLimit as unknown as string),
      txPower: parseInt(d.txPower as unknown as string),
      channelNum: parseInt(d.channelNum as unknown as string),
    };

    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<LoRaConfigInput> = (errors) => {
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
        title={"LoRa Configuration"}
        subtitle={"Configure device LoRa connection"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        buttonProps={{ type: "submit", form: formId }}
      >
        <form
          className="flex flex-col gap-6"
          id={formId}
          onSubmit={handleFormSubmit}
        >
          <ConfigLabel text="Region" error={errors.region?.message}>
            <select {...register("region")}>
              <option value="0">UNSET</option>
              <option value="1">US</option>
              <option value="2">EU (433 MHz)</option>
              <option value="3">EU (868 MHz)</option>
              <option value="4">China</option>
              <option value="5">Japan</option>
              <option value="6">Australia + New Zealand</option>
              <option value="7">Korea</option>
              <option value="8">Taiwan</option>
              <option value="9">Russia</option>
              <option value="10">India</option>
              <option value="11">New Zealand (865 MHz)</option>
              <option value="12">Ukraine (433 MHz)</option>
              <option value="13">Thailand</option>
              <option value="14">2.4 GHz (worldwide)</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="checkbox"
            text="Use Modem Preset"
            error={errors.usePreset?.message}
            {...register("usePreset")}
          />

          <ConfigLabel text="Modem Preset" error={errors.modemPreset?.message}>
            <select disabled={!useModemPreset} {...register("modemPreset")}>
              <option value="0">Long Fast</option>
              <option value="1">Long Slow</option>
              <option value="2">Very Long Slow</option>
              <option value="3">Medium Slow</option>
              <option value="4">Short Slow</option>
              <option value="5">Short Fast</option>
              <option value="6">Long Moderate</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            disabled={useModemPreset}
            type="number"
            text="Bandwidth (kHz)"
            error={errors.bandwidth?.message}
            {...register("bandwidth")}
          />

          <ConfigInput
            disabled={useModemPreset}
            type="number"
            text="Spread Factor (1 << spread_factor)"
            error={errors.spreadFactor?.message}
            {...register("spreadFactor")}
          />

          <ConfigInput
            disabled={useModemPreset}
            type="number"
            text="Coding Rate (4 / coding_rate)"
            error={errors.codingRate?.message}
            {...register("codingRate")}
          />

          <ConfigInput
            type="number"
            text="Frequency Offset (Hz)"
            error={errors.frequencyOffset?.message}
            {...register("frequencyOffset")}
          />

          <ConfigInput
            type="number"
            text="Hop Limit"
            error={errors.hopLimit?.message}
            {...register("hopLimit")}
          />

          <ConfigInput
            type="checkbox"
            text="Transmit Enabled"
            error={errors.txEnabled?.message}
            {...register("txEnabled")}
          />

          <ConfigInput
            disabled={!txEnabled}
            type="number"
            text="Transmit Power"
            error={errors.txPower?.message}
            {...register("txPower")}
          />

          <ConfigInput
            disabled={!txEnabled}
            type="number"
            text="LoRa Channel Number"
            error={errors.channelNum?.message}
            {...register("channelNum")}
          />

          <ConfigInput
            type="checkbox"
            text="Override EU Duty Cycle"
            error={errors.overrideDutyCycle?.message}
            {...register("overrideDutyCycle")}
          />

          {/* TODO OVERRIDE FREQUENCY */}
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default LoRaConfigPage;
