import { Edit3 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { warn } from "tauri-plugin-log-api";

import type { app_device_MeshChannel } from "@bindings/index";

import { MessagingInput } from "@components/Messaging/MessagingInput";
import { TextMessageBubble } from "@components/Messaging/TextMessageBubble";
import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

import { useDeviceApi } from "@features/device/api";
import { selectPrimaryDeviceKey } from "@features/device/selectors";

import { getChannelName, getNumMessagesText } from "@utils/messaging";
import { AppRoutes } from "@utils/routing";

export interface IChannelDetailViewProps {
  channel: app_device_MeshChannel;
  className?: string;
}

export const ChannelDetailView = ({
  channel,
  className = "",
}: IChannelDetailViewProps) => {
  const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());

  const deviceApi = useDeviceApi();

  const navigateTo = useNavigate();

  const handleMessageSubmit = (message: string) => {
    if (!message) {
      alert("Empty message");
      return;
    }

    if (!primaryDeviceKey) {
      warn("No primary serial port, not sending message");
      return;
    }

    deviceApi.sendText({
      deviceKey: primaryDeviceKey,
      text: message,
      channel: channel.config.index,
    });
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
