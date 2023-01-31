import type { MeshChannel } from "@bindings/MeshChannel";

export const getChannelName = (channel: MeshChannel): string => {
  if (channel.config.role === 1) return "Primary";
  return channel.config.settings?.name ?? "Unnamed Channel";
};
