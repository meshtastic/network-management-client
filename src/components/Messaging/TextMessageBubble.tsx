import React from "react";
import { useSelector } from "react-redux";

import type { ChannelMessageWithAck } from "@bindings/ChannelMessageWithAck";
import { selectUserByNodeId } from "@features/device/deviceSelectors";
import { formatMessageTime } from "@utils/messaging";

export interface ITextMessageBubbleProps {
  message: ChannelMessageWithAck;
  className?: string;
}

const TextMessageBubble = ({ message, className = '' }: ITextMessageBubbleProps) => {
  // TODO check if message is from us
  const messagePacket = message.payload.text.packet;
  const user = useSelector(selectUserByNodeId(messagePacket.from));

  return (
    <div className={`${className}`}>
      <p className="flex flex-row gap-2 items-baseline mr-auto mb-1">
        <span className="text-sm font-semibold text-gray-700">{user?.longName ?? messagePacket.from}</span>
        <span className="text-xs font-semibold text-gray-400">{formatMessageTime(messagePacket.rxTime)}</span>
      </p>

      <p className="px-3 py-2 rounded-r-lg rounded-bl-lg bg-white text-sm font-normal text-gray-700 w-fit max-w-[40%]">
        {message.payload.text.data}
      </p>
    </div>
  )
};

export default TextMessageBubble;
