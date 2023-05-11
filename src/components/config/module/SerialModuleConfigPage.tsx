import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  SerialModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface ISerialModuleConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseSerialModuleConfigInput = (
  d: DeepPartial<SerialModuleConfigInput>
): DeepPartial<SerialModuleConfigInput> => ({
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

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.serial?.enabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.serial ?? undefined,
        editedConfig.serial ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<SerialModuleConfigInput>) => {
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
  } = useForm<SerialModuleConfigInput>({
    defaultValues: device?.moduleConfig.serial ?? undefined,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<SerialModuleConfigInput>) => {
          const data = parseSerialModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateModuleConfig({ serial: data }));
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
    if (!currentConfig?.serial) return;
    reset(currentConfig.serial);
    dispatch(configSliceActions.updateModuleConfig({ serial: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"SerialModule Configuration"}
        subtitle={"Configure SerialModule"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
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
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default SerialModuleConfigPage;
