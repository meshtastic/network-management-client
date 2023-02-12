import React from "react";
import { useDispatch } from "react-redux";
// import { MapPinIcon, PencilIcon } from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/outline";

import type { MeshChannel } from "@bindings/MeshChannel";

import ConfigTitle from "@components/Config/ConfigTitle";
// import MapIconButton from "@components/Map/MapIconButton";
import TextMessageBubble from "@components/Messaging/TextMessageBubble";
import MessagingInput from "@components/Messaging/MessagingInput";

import { requestSendMessage } from "@features/device/deviceActions";
import { getChannelName, getNumMessagesText } from "@utils/messaging";

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
    if (!message) {
      alert("Empty message");
      return;
    }

    dispatch(requestSendMessage({ text: message, channel: 0 }));
  };

  return (
    <div className={`${className} flex-1`}>
      <ConfigTitle
        title={getChannelName(channel)}
        subtitle={getNumMessagesText(channel.messages.length)}
        renderIcon={(c) => <PencilIcon className={`${c}`} />}
        onIconClick={() => alert("incomplete feature")}
      >
        <div className="flex flex-1 flex-col gap-6 mb-9">
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
      </ConfigTitle>
    </div>
  );
};

export default ChannelDetailView;
