import React from "react";

import type { app_device_MeshChannel } from "@bindings/index";
import {
  getChannelName,
  getLastChannelMessageDisplayText,
} from "@utils/messaging";
import { Trans, useTranslation } from "react-i18next";

export interface IChannelListElementProps {
  channel: app_device_MeshChannel;
  setActiveChannel: (channel: number | null) => void;
  isSelected: boolean;
}

const ChannelListElement = ({
  channel,
  setActiveChannel,
  isSelected,
}: IChannelListElementProps) => {
  const { t } = useTranslation();

  const lastMessage = channel.messages.at(-1) ?? null;
  const timeLastMessageReceived: string = lastMessage
    ? new Intl.DateTimeFormat("en-us", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(new Date(channel.lastInteraction * 1000))
    : t("general.notApplicable");

  if (isSelected) {
    return (
      <button
        type="button"
        onClick={() => setActiveChannel(null)}
        className="py-2 relative"
      >
        <div
          className="absolute bg-gray-700 dark:bg-gray-200 rounded-lg h-full"
          style={{ width: "calc(100% + 30px)", top: "0px", left: "-15px" }}
        />
        <div className="relative z-10">
          <div className="flex flex-row justify-between items-baseline">
            <p className="flex flex-row gap-2 items-baseline text-gray-50 dark:text-gray-700">
              <span className="text-base font-semibold">
                {getChannelName(channel)}
              </span>
              <span className="text-sm font-normal">
                <Trans
                  i18nKey="messaging.channelNumber"
                  values={{ channelNum: channel.config.index }}
                />
              </span>
            </p>
            <p className="text-xs font-normal text-gray-100 dark:text-gray-400">
              {timeLastMessageReceived}
            </p>
          </div>
          <p className="min-w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis text-base font-normal text-gray-400 dark:text-gray-500">
            {getLastChannelMessageDisplayText(lastMessage)}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActiveChannel(channel.config.index)}
      className="py-2"
    >
      <div className="flex flex-row justify-between items-baseline">
        <p className="flex flex-row gap-2 items-baseline text-gray-700 dark:text-gray-400">
          <span className="text-base font-semibold ">
            {getChannelName(channel)}
          </span>
          <span className="text-sm font-normal">
            <Trans
              i18nKey="messaging.channelNumber"
              values={{ channelNum: channel.config.index }}
            />
          </span>
        </p>
        <p className="text-xs font-normal text-gray-400 dark:text-gray-500">
          {timeLastMessageReceived}
        </p>
      </div>
      <p className="min-w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis text-base font-normal text-gray-500 dark:text-gray-500">
        {getLastChannelMessageDisplayText(lastMessage)}
      </p>
    </button>
  );
};

export default ChannelListElement;
