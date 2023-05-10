import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  CannedMessageModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
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

  watch((d) => {
    const data = parseCannedMessageModuleConfigInput(d);
    updateStateFlags(data);
    dispatch(configSliceActions.updateModuleConfig({ cannedMessage: data }));
  });

  const handleFormReset = () => {
    if (!currentConfig?.cannedMessage) return;
    reset(currentConfig.cannedMessage);
    dispatch(configSliceActions.updateModuleConfig({ cannedMessage: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"CannedMessage Configuration"}
        subtitle={"Configure CannedMessage"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
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
              <option value="">None Selected</option>
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
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default CannedMessageConfigPage;
