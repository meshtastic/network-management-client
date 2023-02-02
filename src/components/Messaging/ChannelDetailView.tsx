import React from "react";
import ScrollableFeed from 'react-scrollable-feed';
import { PencilIcon } from "@heroicons/react/24/outline";

import type { MeshChannel } from "@bindings/MeshChannel";
import TextMessageBubble from "@components/Messaging/TextMessageBubble";
import { getChannelName, getNumMessagesText } from "@utils/messaging";

export interface IChannelDetailViewProps {
  channel: MeshChannel;
  className?: string;
}

const ChannelDetailView = ({ channel, className = "" }: IChannelDetailViewProps) => {
  return (
    <div className={`${className} flex w-full h-full bg-gray-100`} style={{ flexFlow: 'column' }}>
      <div className="contents">
        <div className="flex-initial flex flex-row justify-between items-center px-9 min-h-[5rem] h-20 bg-white border-b border-l border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">{getChannelName(channel)}</h2>
            <p className="text-xs font-normal text-gray-400">{getNumMessagesText(channel.messages.length)}</p>
          </div>

          <button type="button" onClick={() => alert("incomplete feature")}>
            <PencilIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-auto flex overflow-y-auto relative" style={{ flexFlow: 'column' }}>
          <ScrollableFeed>
            {channel.messages.map(m => (
              <div key={m.payload.text.packet.id} className="mx-9 first:mt-9 last:mb-9 mb-6">
                <TextMessageBubble message={m} />
              </div>
            ))}
          </ScrollableFeed>

          <div className="absolute bottom-0 left-0 w-full">
            <div className="bg-white m-9">input</div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ChannelDetailView;
