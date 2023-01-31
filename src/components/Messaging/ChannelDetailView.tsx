import React from "react";

import type { MeshChannel } from "@bindings/MeshChannel";
import { getChannelName } from "@utils/messaging";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IChannelDetailViewProps {
  channel: MeshChannel;
  className?: string;
}

const ChannelDetailView = ({ channel, className = "" }: IChannelDetailViewProps) => {
  return (
    <div className={`${className} w-full h-full bg-gray-100`}>
      <div className="flex flex-row justify-between items-center px-9 h-20 bg-white border-b border-l border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">{getChannelName(channel)}</h2>
          <p className="text-xs font-normal text-gray-400">{channel.messages.length} messages</p>
        </div>

        <button type="button" onClick={() => alert("incomplete feature")}>
          <PencilIcon className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="flex flex-col-reverse p-9">
        message content
      </div>
    </div>
  )
};

export default ChannelDetailView;
