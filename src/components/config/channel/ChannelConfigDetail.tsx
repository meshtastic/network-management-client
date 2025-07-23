import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type DeepPartial, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import debounce from "lodash.debounce";

import { ConfigInput } from "@components/config/ConfigInput";
import { ConfigSelect } from "@components/config/ConfigSelect";
import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

import {
  selectCurrentChannelConfig,
  selectEditedChannelConfig,
} from "@features/config/selectors";
import {
  type ChannelConfigInput,
  configSliceActions,
} from "@features/config/slice";

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
  d: DeepPartial<ChannelConfigInput>,
): DeepPartial<ChannelConfigInput> => ({
  ...d,
  role:
    d.role !== undefined ? parseInt(d.role as unknown as string) : undefined,
});

export const ChannelConfigDetail = ({
  channelNum,
  className = "",
}: IChannelConfigDetailProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const currentMeshChannel = useSelector(
    selectCurrentChannelConfig(channelNum),
  );
  const editedConfig = useSelector(selectEditedChannelConfig(channelNum));

  const currentConfig = useMemo(
    () =>
      currentMeshChannel
        ? getCurrentConfigFromMeshChannel(currentMeshChannel)
        : null,
    [currentMeshChannel],
  );
  const channelName = currentMeshChannel
    ? getChannelName(currentMeshChannel)
    : t("general.unknown");

  const [channelDisabled, setChannelDisabled] = useState(
    currentMeshChannel?.config.role === 0, // DISABLED
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        currentConfig ?? undefined,
        editedConfig ?? undefined,
      ),
    [currentConfig, editedConfig],
  );

  const updateStateFlags = (d: DeepPartial<ChannelConfigInput>) => {
    setChannelDisabled(d.role === 0); // DISABLED
  };

  useEffect(() => {
    if (!defaultValues) return;
    updateStateFlags(defaultValues);
  }, [updateStateFlags, defaultValues]);

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
            ]),
          );
        },
        500,
        { leading: true },
      ),
    [dispatch, updateStateFlags, channelNum],
  );

  watch(updateConfigHander);

  // Cancel handlers when unmounting
  useEffect(() => {
    return () => updateConfigHander.cancel();
  }, [updateConfigHander]);

  const handleFormReset = () => {
    if (!currentMeshChannel) return;
    reset(getCurrentConfigFromMeshChannel(currentMeshChannel));
    dispatch(
      configSliceActions.updateChannelConfig([{ channelNum, config: null }]),
    );
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.channel.detail.title")}
        subtitle={t("config.channel.detail.description", { channelName })}
        renderIcon={(c) => <RotateCcw strokeWidth={1.5} className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigSelect
            text={t("config.channel.detail.channelRole.title")}
            {...register("role")}
          >
            <option value="0">
              {t("config.channel.detail.channelRole.disabled")}
            </option>
            <option value="1">
              {t("config.channel.detail.channelRole.primary")}
            </option>
            <option value="2">
              {t("config.channel.detail.channelRole.secondary")}
            </option>
          </ConfigSelect>

          <ConfigInput
            type="text"
            text={t("config.channel.detail.channelName")}
            disabled={channelDisabled}
            error={errors.name?.message}
            {...register("name")}
          />

          <ConfigInput
            type="text"
            text={t("config.channel.detail.psk")}
            disabled={channelDisabled}
            error={errors.psk?.message}
            {...register("psk")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.channel.detail.uplinkEnabled")}
            disabled={channelDisabled}
            error={errors.uplinkEnabled?.message}
            {...register("uplinkEnabled")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.channel.detail.downlinkEnabled")}
            disabled={channelDisabled}
            error={errors.downlinkEnabled?.message}
            {...register("downlinkEnabled")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};
