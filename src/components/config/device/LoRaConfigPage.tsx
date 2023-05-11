import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  LoRaConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface ILoRaConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseLoRaConfigInput = (
  d: DeepPartial<LoRaConfigInput>
): DeepPartial<LoRaConfigInput> => ({
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
});

const LoRaConfigPage = ({ className = "" }: ILoRaConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const [useModemPreset, setUseModemPreset] = useState(
    !device?.config.lora?.modemPreset ?? false
  );

  const [txEnabled, setTxEnabled] = useState(
    device?.config.lora?.txEnabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.lora ?? undefined,
        editedConfig.lora ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<LoRaConfigInput>) => {
    setUseModemPreset(!!d.usePreset);
    setTxEnabled(!!d.txEnabled);
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
  } = useForm<LoRaConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<LoRaConfigInput>) => {
          const data = parseLoRaConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateRadioConfig({ lora: data }));
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
    if (!currentConfig?.lora) return;
    reset(currentConfig.lora);
    dispatch(configSliceActions.updateRadioConfig({ lora: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"LoRa Configuration"}
        subtitle={"Configure device LoRa connection"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
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
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default LoRaConfigPage;
