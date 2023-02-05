import React from "react";
import { useSelector } from "react-redux";

import type { ChannelMessageWithAck } from "@bindings/ChannelMessageWithAck";
import {
  selectUserByNodeId,
  selectConnectedDeviceNodeId,
} from "@features/device/deviceSelectors";
import { formatMessageTime, formatMessageUsername } from "@utils/messaging";

export interface ITextMessageBubbleProps {
  message: ChannelMessageWithAck;
  className?: string;
}

const TextMessageBubble = ({
  message,
  className = "",
}: ITextMessageBubbleProps) => {
  const messagePacket = message.payload.text.packet;
  const user = useSelector(selectUserByNodeId(messagePacket.from));
  const ownNodeId = useSelector(selectConnectedDeviceNodeId());

  const { displayText, isSelf } = formatMessageUsername(
    user?.longName,
    ownNodeId ?? 0,
    messagePacket.from
  );

  if (isSelf)
    return (
      <div className={`${className}`}>
        <p className="flex flex-row justify-end mb-1 gap-2 items-baseline">
          <span className="text-xs font-semibold text-gray-400">
            {formatMessageTime(messagePacket.rxTime)}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {displayText}
          </span>
        </p>

        <p className="ml-auto px-3 py-2 w-fit max-w-[40%] rounded-l-lg rounded-br-lg bg-gray-700 text-sm font-medium text-gray-100 border border-gray-400">
          {message.payload.text.data}
        </p>
      </div>
    );

  return (
    <div className={`${className}`}>
      <p className="flex flex-row justify-start mb-1 gap-2 items-baseline">
        <span className="text-sm font-semibold text-gray-700">
          {displayText}
        </span>
        <span className="text-xs font-semibold text-gray-400">
          {formatMessageTime(messagePacket.rxTime)}
        </span>
      </p>

      <p className="mr-auto px-3 py-2 w-fit max-w-[40%] rounded-r-lg rounded-bl-lg bg-white text-sm font-normal text-gray-700 border border-gray-200">
        {message.payload.text.data}
      </p>
    </div>
  );
};

export default TextMessageBubble;
