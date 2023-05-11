import type {
  app_device_MeshChannel,
  app_device_ChannelMessageWithState,
  app_device_ChannelMessagePayload,
} from "@bindings/index";

export const getChannelName = (channel: app_device_MeshChannel): string => {
  let nameString = "";
  if (channel.config.role === 1) {
    nameString += "*";
  }

  if (!channel.config.settings?.name) {
    nameString += "Unnamed Channel";
    return nameString;
  }

  nameString += channel.config.settings.name;
  return nameString;
};

export const formatMessageUsername = (
  longName: string | undefined,
  ownNodeId: number,
  from: number
): { displayText: string; isSelf: boolean } => {
  if (from === 0 || from == ownNodeId) {
    return { displayText: "You", isSelf: true };
  }
  if (!longName) return { displayText: `${from}`, isSelf: false };
  return { displayText: longName, isSelf: false };
};

export const formatMessageTime = (time: number): string => {
  return new Intl.DateTimeFormat("en-us", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(time * 1000));
};

export const getNumMessagesText = (numMessages: number): string => {
  if (numMessages === 1) return "1 message";
  return `${numMessages} messages`;
};

export const getPacketDisplayText = ({
  data,
  type,
}: app_device_ChannelMessagePayload) => {
  if (type === "text") return data;

  const { name, latitudeI, longitudeI } = data;
  return `Received waypoint "${name}" at ${latitudeI / 1e7}, ${longitudeI / 1e7
    }`;
};

export const getLastChannelMessageDisplayText = (
  lastMessage: app_device_ChannelMessageWithState | null
) => {
  if (lastMessage?.payload.type) {
    return getPacketDisplayText(lastMessage.payload);
  }

  return "No messages received on this channel.";
};
