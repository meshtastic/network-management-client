import React from "react";
import type { MeshChannel } from "@bindings/MeshChannel";
import { getChannelName } from "@utils/messaging";

export interface IChannelListElementProps {
  channel: MeshChannel;
  setActiveChannel: (channel: number | null) => void;
  isSelected: boolean
}

const ChannelListElement = ({ channel, setActiveChannel, isSelected }: IChannelListElementProps) => {
  const lastMessage = channel.messages.at(-1) ?? null;
  const timeLastMessageReceived: string = lastMessage ?
    new Intl.DateTimeFormat("en-us", { hour: 'numeric', minute: "numeric", hour12: true })
      .format(new Date(channel.lastInteraction * 1000))
    : "N/A";


  if (isSelected) {
    return (
      <button type="button" onClick={() => setActiveChannel(null)} className="py-2 relative">
        <div className="absolute bg-gray-700 rounded-lg h-full -z-10" style={{ width: 'calc(100% + 30px)', top: '0px', left: '-15px' }} />
        <div className="flex flex-row justify-between items-baseline">
          <p className="flex flex-row gap-2 items-baseline text-gray-50">
            <span className="text-base font-semibold">{getChannelName(channel)}</span>
            <span className="text-sm font-normal">(ch {channel.config.index})</span>
          </p>
          <p className="text-xs font-normal text-gray-100">{timeLastMessageReceived}</p>
        </div>
        <p className="min-w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis text-base font-normal text-gray-400">
          {lastMessage?.payload.text.data ?? "No messages received on this channel."}
        </p>
      </button>
    );
  }

  return (
    <button type="button" onClick={() => setActiveChannel(channel.config.index)} className="py-2">
      <div className="flex flex-row justify-between items-baseline">
        <p className="flex flex-row gap-2 items-baseline text-gray-700">
          <span className="text-base font-semibold ">{getChannelName(channel)}</span>
          <span className="text-sm font-normal">(ch {channel.config.index})</span>
        </p>
        <p className="text-xs font-normal text-gray-400">{timeLastMessageReceived}</p>
      </div>
      <p className="min-w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis text-base font-normal text-gray-500">
        {lastMessage?.payload.text.data ?? "No messages received on this channel."}
      </p>
    </button>
  )
};

export default ChannelListElement;
