import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  ChannelConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentChannelConfig,
  selectEditedChannelConfig,
} from "@features/config/configSelectors";

import {
  getCurrentConfigFromMeshChannel,
  getDefaultConfigInput,
} from "@utils/form";
import { getChannelName } from "@utils/messaging";

export interface IChannelConfigDetailProps {
  channelNum: number;
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseChannelConfigInput = (
  d: DeepPartial<ChannelConfigInput>
): DeepPartial<ChannelConfigInput> => ({
  ...d,
  role: d.role != undefined ? parseInt(d.role as unknown as string) : undefined,
});

const ChannelConfigDetail = ({
  channelNum,
  className = "",
}: IChannelConfigDetailProps) => {
  const dispatch = useDispatch();

  const currentMeshChannel = useSelector(
    selectCurrentChannelConfig(channelNum)
  );
  const editedConfig = useSelector(selectEditedChannelConfig(channelNum));

  const currentConfig = useMemo(
    () =>
      currentMeshChannel
        ? getCurrentConfigFromMeshChannel(currentMeshChannel)
        : null,
    [currentMeshChannel]
  );
  const channelName = currentMeshChannel
    ? getChannelName(currentMeshChannel)
    : "UNK";

  const [channelDisabled, setChannelDisabled] = useState(
    currentMeshChannel?.config.role === 0 // DISABLED
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        currentConfig ?? undefined,
        editedConfig ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<ChannelConfigInput>) => {
    setChannelDisabled(d.role === 0); // DISABLED
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
  } = useForm<ChannelConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<ChannelConfigInput>) => {
          const data = parseChannelConfigInput(d);
          updateStateFlags(data);
          dispatch(
            configSliceActions.updateChannelConfig([
              { channelNum, config: data },
            ])
          );
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
    if (!currentMeshChannel) return;
    reset(getCurrentConfigFromMeshChannel(currentMeshChannel));
    dispatch(
      configSliceActions.updateChannelConfig([{ channelNum, config: null }])
    );
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Channel Configuration"}
        subtitle={`Configure channel "${channelName}"`}
        renderIcon={(c) => <RotateCcw strokeWidth={1.5} className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigLabel text="Channel Role" error={errors.role?.message}>
            <select {...register("role")}>
              <option value="0">Disabled</option>
              <option value="1">Primary Channel</option>
              <option value="2">Secondary Channel</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="text"
            text="Channel Name"
            disabled={channelDisabled}
            error={errors.name?.message}
            {...register("name")}
          />

          <ConfigInput
            type="text"
            text="PSK"
            disabled={channelDisabled}
            error={errors.psk?.message}
            {...register("psk")}
          />

          <ConfigInput
            type="checkbox"
            text="Uplink Enabled"
            disabled={channelDisabled}
            error={errors.uplinkEnabled?.message}
            {...register("uplinkEnabled")}
          />

          <ConfigInput
            type="checkbox"
            text="Downlink Enabled"
            disabled={channelDisabled}
            error={errors.downlinkEnabled?.message}
            {...register("downlinkEnabled")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default ChannelConfigDetail;
