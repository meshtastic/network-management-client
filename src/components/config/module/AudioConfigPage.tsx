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
  AudioModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IAudioConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseAudioModuleConfigInput = (
  d: AudioModuleConfigInput
): AudioModuleConfigInput => ({
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

  const [codec2Disabled, setCodec2Disabled] = useState(
    !device?.moduleConfig.audio?.codec2Enabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AudioModuleConfigInput>({
    defaultValues: device?.moduleConfig.audio ?? undefined,
  });

  watch((d) => {
    setCodec2Disabled(!d.codec2Enabled);
  });

  const onValidSubmit: SubmitHandler<AudioModuleConfigInput> = (d) => {
    const data = parseAudioModuleConfigInput(d);
    dispatch(configSliceActions.updateModuleConfig({ audio: data }));
  };

  const onInvalidSubmit: SubmitErrorHandler<AudioModuleConfigInput> = (
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
        title={"Audio Configuration"}
        subtitle={"Configure Audio"}
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
            text="Codec2 Enabled"
            error={errors.codec2Enabled?.message}
            {...register("codec2Enabled")}
          />

          <ConfigInput
            type="number"
            text="PTT Pin"
            disabled={codec2Disabled}
            error={errors.pttPin?.message}
            {...register("pttPin")}
          />

          <ConfigLabel text="Audio Bitrate" error={errors.bitrate?.message}>
            <select disabled={codec2Disabled} {...register("bitrate")}>
              <option value="0">Default (700B)</option>
              <option value="1">3200 bps</option>
              <option value="2">2400 bps</option>
              <option value="3">1600 bps</option>
              <option value="4">1400 bps</option>
              <option value="5">1300 bps</option>
              <option value="6">1200 bps</option>
              <option value="7">700 bps</option>
              <option value="8">700B bps</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="number"
            text="i2S WS Pin"
            disabled={codec2Disabled}
            error={errors.i2SWs?.message}
            {...register("i2SWs")}
          />

          <ConfigInput
            type="number"
            text="i2S SD Pin"
            disabled={codec2Disabled}
            error={errors.i2SSd?.message}
            {...register("i2SSd")}
          />

          <ConfigInput
            type="number"
            text="i2S DIN Pin"
            disabled={codec2Disabled}
            error={errors.i2SDin?.message}
            {...register("i2SDin")}
          />

          <ConfigInput
            type="number"
            text="i2S Serial Clock Pin"
            disabled={codec2Disabled}
            error={errors.i2SSck?.message}
            {...register("i2SSck")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default AudioConfigPage;
