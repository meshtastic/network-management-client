import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Edit3 } from "lucide-react";

import type { app_device_MeshChannel } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import TextMessageBubble from "@components/Messaging/TextMessageBubble";
import MessagingInput from "@components/Messaging/MessagingInput";

import { requestSendMessage } from "@features/device/actions";
import { selectPrimaryDeviceKey } from "@features/device/selectors";

import { getChannelName, getNumMessagesText } from "@utils/messaging";
import { AppRoutes } from "@utils/routing";

export interface IChannelDetailViewProps {
  channel: app_device_MeshChannel;
  className?: string;
}

const ChannelDetailView = ({
  channel,
  className = "",
}: IChannelDetailViewProps) => {
  const dispatch = useDispatch();
  const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());

  const navigateTo = useNavigate();

  const handleMessageSubmit = (message: string) => {
    if (!message) {
      alert("Empty message");
      return;
    }

    if (!primaryDeviceKey) {
      console.warn("No primary serial port, not sending message");
      return;
    }

    dispatch(
      requestSendMessage({
        deviceKey: primaryDeviceKey,
        text: message,
        channel: channel.config.index,
      })
    );
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={getChannelName(channel)}
        subtitle={getNumMessagesText(channel.messages.length)}
        renderIcon={(c) => <Edit3 strokeWidth={1.5} className={`${c}`} />}
        buttonTooltipText="Edit channel"
        onIconClick={() =>
          navigateTo(`${AppRoutes.CONFIGURE_CHANNELS}/${channel.config.index}`)
        }
      >
        <div className="flex flex-1 flex-col gap-6 mb-9 overflow-y-auto">
          {channel.messages.map((m) => (
            <TextMessageBubble
              className="pr-6"
              message={m}
              key={m.payload.packet.id}
            />
          ))}
        </div>

        <div className="flex flex-row gap-4">
          <MessagingInput
            placeholder="Send message"
            onSubmit={handleMessageSubmit}
            className="w-full flex-1"
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default ChannelDetailView;
