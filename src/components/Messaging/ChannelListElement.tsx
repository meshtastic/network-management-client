import React from "react";
import type { MeshChannel } from "@bindings/MeshChannel";

export interface IChannelListElementProps {
  channel: MeshChannel;
  isSelected: boolean
}

const ChannelListElement = ({ channel, isSelected }: IChannelListElementProps) => {
  const lastMessage = channel.messages.at(-1) ?? null;
  const timeLastMessageReceived: string = lastMessage ?
    new Intl.DateTimeFormat("en-us", { hour: 'numeric', minute: "numeric", hour12: true })
      .format(new Date(lastMessage?.payload.text.packet.rxTime ?? 0 * 1000))
    : "N/A";

  const getChannelName = (): string => {
    if (channel.config.role === 1) return "Primary";
    return channel.config.settings?.name ?? "Unnamed Channel";
  }

  if (isSelected) {
    return (
      <div>selected</div>
    );
  }

  return (
    <div>
      <div className="flex flex-row justify-between mb-1 items-baseline">
        <p className="flex flex-row gap-2 items-baseline">
          <span className="text-base font-semibold text-gray-700">{getChannelName()}</span>
          <span className="text-sm font-normal text-gray-700">(ch {channel.config.index})</span>
        </p>
        <p className="text-xs font-normal text-gray-400">{timeLastMessageReceived}</p>
      </div>
      <p className="min-w-full whitespace-nowrap overflow-hidden overflow-ellipsis text-s leading-4 font-normal text-gray-500">
        {lastMessage?.payload.text.data ?? "No messages received on this channel."}
      </p>
    </div>
  )
};

export default ChannelListElement;
