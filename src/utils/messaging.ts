import type { MeshChannel } from "@bindings/MeshChannel";

export const getChannelName = (channel: MeshChannel): string => {
  if (channel.config.role === 1) return "Primary";
  return channel.config.settings?.name ?? "Unnamed Channel";
};

export const formatMessageUsername = (
  longName: string | undefined,
  ownNodeId: number,
  from: number
): { displayText: string; isSelf: boolean } => {
  if (from === 0 || from == ownNodeId)
    return { displayText: "You", isSelf: true };
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
