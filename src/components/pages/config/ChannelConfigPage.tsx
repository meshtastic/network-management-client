import React, { useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Upload } from "lucide-react";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";
import ChannelConfigDetail from "@components/config/channel/ChannelConfigDetail";

import { requestCommitConfig } from "@features/config/actions";
import type { ChannelConfigInput } from "@features/config/slice";
import { selectEditedAllChannelConfig } from "@features/config/selectors";
import { selectDeviceChannels } from "@features/device/selectors";

import { getCurrentConfigFromMeshChannel } from "@utils/form";
import { getChannelName } from "@utils/messaging";

const getNumberOfPendingChanges = (
  currentChannelConfig: ChannelConfigInput | null,
  editedChannelConfig: ChannelConfigInput | undefined
): number => {
  if (!currentChannelConfig) return -1;
  if (!editedChannelConfig) return 0;

  return Object.entries(editedChannelConfig ?? {}).reduce(
    (accum, [editedConfigKey, editedConfigValue]) => {
      if (editedConfigValue == undefined) return accum; // ! Need to allow falsy values

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const currentFieldValue =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (currentChannelConfig as Record<string, any>)?.[editedConfigKey] ??
        null;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const editedFieldValue =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (editedChannelConfig as Record<string, any>)?.[editedConfigKey] ?? null;

      if (
        // Need [] === [] to be true
        JSON.stringify(currentFieldValue) !== JSON.stringify(editedFieldValue)
      ) {
        return accum + 1;
      }

      return accum;
    },
    0
  );
};

const ChannelConfigPage = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const meshChannels = useSelector(selectDeviceChannels());

  const { channelId } = useParams();

  const currentChannelConfig = useMemo(
    () => meshChannels.map((c) => getCurrentConfigFromMeshChannel(c)),
    [meshChannels]
  );
  const editedChannelConfig = useSelector(selectEditedAllChannelConfig());

  const [activeChannelIndex, setActiveChannelIndex] = useState<number | null>(
    parseInt(Object.entries(currentChannelConfig)[0]?.[0]) ?? null
  );

  useLayoutEffect(() => {
    if (!channelId) return;
    const parsedChannelId = parseInt(channelId);

    if (isNaN(parsedChannelId)) return;
    setActiveChannelIndex(parsedChannelId);
  }, [channelId]);

  return (
    <div className="flex-1">
      <ConfigLayout
        title={t("config.channel.title")}
        backtrace={[t("sidebar.configureChannels")]}
        renderTitleIcon={(c) => <Upload strokeWidth={1.5} className={`${c}`} />}
        titleIconTooltip={t("config.uploadChanges")}
        onTitleIconClick={() => dispatch(requestCommitConfig(["channel"]))}
        renderOptions={() =>
          meshChannels.map((c) => {
            const displayName = getChannelName(c);

            const pendingChanges = getNumberOfPendingChanges(
              currentChannelConfig[c.config.index],
              editedChannelConfig[c.config.index] ?? undefined
            );

            return (
              <ConfigOption
                key={c.config.index}
                title={
                  displayName ||
                  t("config.channel.option.title", {
                    channelIndex: c.config.index,
                  })
                }
                subtitle={t("config.numPendingChanges", {
                  numChanges: pendingChanges,
                })}
                isActive={activeChannelIndex === c.config.index}
                onClick={() => setActiveChannelIndex(c.config.index)}
              />
            );
          })
        }
      >
        {activeChannelIndex != null ? (
          <ChannelConfigDetail
            key={activeChannelIndex}
            channelNum={activeChannelIndex}
          />
        ) : (
          <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
            <p className="m-auto text-base font-normal text-gray-700">
              {t("config.channel.unkownChannel")}
            </p>
          </div>
        )}
      </ConfigLayout>
    </div>
  );
};

export default ChannelConfigPage;
