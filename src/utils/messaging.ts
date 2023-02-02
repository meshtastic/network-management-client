import type { MeshChannel } from "@bindings/MeshChannel";

export const getChannelName = (channel: MeshChannel): string => {
  if (channel.config.role === 1) return "Primary";
  return channel.config.settings?.name ?? "Unnamed Channel";
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
