import React from "react";
import { useSelector } from "react-redux";

import type { ChannelMessageWithState } from "@bindings/ChannelMessageWithState";
import {
  selectUserByNodeId,
  selectConnectedDeviceNodeId,
} from "@features/device/deviceSelectors";
import {
  formatMessageTime,
  formatMessageUsername,
  getPacketDisplayText,
} from "@utils/messaging";

export interface ITextMessageBubbleProps {
  message: ChannelMessageWithState;
  className?: string;
}

const getAcknowledgementText = (
  message: ChannelMessageWithState
): { text: string; isError: boolean } => {
  if (message.state === "acknowledged") {
    return { text: "Acknowledged", isError: false };
  }

  if (message.state === "pending") {
    return { text: "Transmitting...", isError: false };
  }

  return { text: message.state.error, isError: true };
};

const TextMessageBubble = ({
  message,
  className = "",
}: ITextMessageBubbleProps) => {
  const { packet } = message.payload;

  const user = useSelector(selectUserByNodeId(packet.from));
  const ownNodeId = useSelector(selectConnectedDeviceNodeId());

  const { displayText: usernameDisplayText, isSelf } = formatMessageUsername(
    user?.longName,
    ownNodeId ?? 0,
    packet.from
  );

  if (isSelf) {
    const { text, isError } = getAcknowledgementText(message);

    return (
      <div className={`${className}`}>
        <p className="flex flex-row justify-end mb-1 gap-2 items-baseline">
          <span className="text-xs font-semibold text-gray-400">
            {formatMessageTime(packet.rxTime)}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {usernameDisplayText}
          </span>
        </p>

        <p className="ml-auto px-3 py-2 w-fit max-w-[40%] rounded-l-lg rounded-br-lg bg-gray-700 text-sm font-medium text-gray-100 border border-gray-400 break-words">
          {getPacketDisplayText(message.payload)}
        </p>

        <p
          className={`ml-auto mt-1 text-xs text-right ${
            isError ? "font-semibold text-red-500" : "font-normal text-gray-500"
          }`}
        >
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <p className="flex flex-row justify-start mb-1 gap-2 items-baseline">
        <span className="text-sm font-semibold text-gray-700">
          {usernameDisplayText}
        </span>
        <span className="text-xs font-semibold text-gray-400">
          {formatMessageTime(packet.rxTime)}
        </span>
      </p>

      <p className="mr-auto px-3 py-2 w-fit max-w-[40%] rounded-r-lg rounded-bl-lg bg-white text-sm font-normal text-gray-700 border border-gray-200 break-words">
        {getPacketDisplayText(message.payload)}
      </p>
    </div>
  );
};

export default TextMessageBubble;
