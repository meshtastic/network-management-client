import React from "react";

export interface IChatBubbleProps {
  time: Date;
  message: string;
  fromSelf: boolean;
  displayName: string;
}

const ChatBubble = ({
  time,
  message,
  fromSelf,
  displayName,
}: IChatBubbleProps) => {
  const dateFormatter = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/New_York",
  });

  return (
    <div>
      <div className="flex flex-row justify-between pb-1">
        <p className="text-s font-bold text-gray-700">
          {fromSelf ? "You" : displayName}
        </p>
        <p className="text-xs font-semibold text-gray-500">
          {dateFormatter.format(time)}
        </p>
      </div>
      <p
        className={`px-3 py-2 rounded-lg ${
          fromSelf
            ? "bg-blue-500 text-white font-bold"
            : "bg-gray-100 text-gray-800 font-normal"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default ChatBubble;
