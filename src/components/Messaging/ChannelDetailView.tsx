import React from "react";
import { useDispatch } from "react-redux";
// import { MapPinIcon, PencilIcon } from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/outline";

import type { MeshChannel } from "@bindings/MeshChannel";
import TextMessageBubble from "@components/Messaging/TextMessageBubble";
import MessagingInput from "@components/Messaging/MessagingInput";
import { getChannelName, getNumMessagesText } from "@utils/messaging";
import { requestSendMessage } from "@app/features/device/deviceActions";
// import MapIconButton from "@components/Map/MapIconButton";

export interface IChannelDetailViewProps {
  channel: MeshChannel;
  className?: string;
}

const ChannelDetailView = ({
  channel,
  className = "",
}: IChannelDetailViewProps) => {
  const dispatch = useDispatch();

  const handleMessageSubmit = (message: string) => {
    dispatch(requestSendMessage({ text: message, channel: 0 }));
  };

  return (
    <div className={`${className} flex flex-col w-full h-full bg-gray-100`}>
      <div className="flex-initial flex flex-row justify-between items-center px-9 min-h-[5rem] h-20 bg-white border-b border-l border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">
            {getChannelName(channel)}
          </h2>
          <p className="text-xs font-normal text-gray-400">
            {getNumMessagesText(channel.messages.length)}
          </p>
        </div>

        <button type="button" onClick={() => alert("incomplete feature")}>
          <PencilIcon className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="p-9">
        <div className="flex flex-col gap-6 mb-9">
          {channel.messages.map((m) => (
            <TextMessageBubble message={m} key={m.payload.text.packet.id} />
          ))}
        </div>

        <div className="flex flex-row gap-4">
          <MessagingInput
            placeholder="Send message"
            onSubmit={handleMessageSubmit}
            className="w-full flex-1"
          />
          {/* <MapIconButton
            className="w-12 h-12 no-shadow"
            onClick={() => console.log('Clicked "send waypoint" button')}
          >
            <MapPinIcon className="m-auto w-6 h-6 text-gray-400" />
          </MapIconButton> */}
        </div>
      </div>
    </div>
  );
};

export default ChannelDetailView;
