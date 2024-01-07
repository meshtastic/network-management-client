import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DeepPartial, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import debounce from "lodash.debounce";

import { ConfigInput } from "@components/config/ConfigInput";
import { ConfigSelect } from "@components/config/ConfigSelect";
import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

// import {
//   AudioModuleConfigInput,
//   configSliceActions,
// } from "@features/config/configSlice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";
import type { AudioModuleConfigInput } from "@features/config/slice";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IAudioConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
export const parseAudioModuleConfigInput = (
  d: DeepPartial<AudioModuleConfigInput>
): DeepPartial<AudioModuleConfigInput> => ({
  ...d,
  pttPin: parseInt(d.pttPin as unknown as string),
  bitrate: parseInt(d.bitrate as unknown as string),
  i2SWs: parseInt(d.i2SWs as unknown as string),
  i2SSd: parseInt(d.i2SSd as unknown as string),
  i2SDin: parseInt(d.i2SDin as unknown as string),
  i2SSck: parseInt(d.i2SSck as unknown as string),
});

const AudioConfigPage = ({ className = "" }: IAudioConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [codec2Disabled, setCodec2Disabled] = useState(
    !device?.moduleConfig.audio?.codec2Enabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.audio ?? undefined,
        // ! https://github.com/ajmcquilkin/meshtastic-network-management-client/issues/382
        undefined
        // editedConfig.audio ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<AudioModuleConfigInput>) => {
    setCodec2Disabled(!d.codec2Enabled);
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
  } = useForm<AudioModuleConfigInput>({
    defaultValues: device?.moduleConfig.audio ?? undefined,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<AudioModuleConfigInput>) => {
          const data = parseAudioModuleConfigInput(d);
          updateStateFlags(data);
          // ! https://github.com/ajmcquilkin/meshtastic-network-management-client/issues/382
          // dispatch(configSliceActions.updateModuleConfig({ audio: data }));
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
    if (!currentConfig?.audio) return;
    reset(currentConfig.audio);
    // ! https://github.com/ajmcquilkin/meshtastic-network-management-client/issues/382
    // dispatch(configSliceActions.updateModuleConfig({ audio: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Audio Configuration"}
        subtitle={"Configure networked audio"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text="Codec2 Enabled"
            error={errors.codec2Enabled?.message as string}
            {...register("codec2Enabled")}
          />

          <ConfigInput
            type="number"
            text="PTT Pin"
            disabled={codec2Disabled}
            error={errors.pttPin?.message as string}
            {...register("pttPin")}
          />

          <ConfigSelect
            text="Audio Bitrate"
            disabled={codec2Disabled}
            {...register("bitrate")}
          >
            <option value="0">Default (700B)</option>
            <option value="1">3200 bps</option>
            <option value="2">2400 bps</option>
            <option value="3">1600 bps</option>
            <option value="4">1400 bps</option>
            <option value="5">1300 bps</option>
            <option value="6">1200 bps</option>
            <option value="7">700 bps</option>
            <option value="8">700B bps</option>
          </ConfigSelect>

          <ConfigInput
            type="number"
            text="i2S WS Pin"
            disabled={codec2Disabled}
            error={errors.i2SWs?.message as string}
            {...register("i2SWs")}
          />

          <ConfigInput
            type="number"
            text="i2S SD Pin"
            disabled={codec2Disabled}
            error={errors.i2SSd?.message as string}
            {...register("i2SSd")}
          />

          <ConfigInput
            type="number"
            text="i2S DIN Pin"
            disabled={codec2Disabled}
            error={errors.i2SDin?.message as string}
            {...register("i2SDin")}
          />

          <ConfigInput
            type="number"
            text="i2S Serial Clock Pin"
            disabled={codec2Disabled}
            error={errors.i2SSck?.message as string}
            {...register("i2SSck")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};
