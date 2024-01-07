import { i18next } from "@app/i18n";

import type {
  app_device_ChannelMessagePayload,
  app_device_ChannelMessageWithState,
  app_device_MeshChannel,
  app_device_NormalizedWaypoint,
} from "@bindings/index";
import { formatLocation } from "@utils/map";

export const getChannelName = (channel: app_device_MeshChannel): string => {
  let nameString = "";
  if (channel.config.role === 1) {
    nameString += "*";
  }

  if (!channel.config.settings?.name) {
    nameString += i18next.t("messaging.unnamedChannel");
    return nameString;
  }

  nameString += channel.config.settings.name;
  return nameString;
};

export const formatMessageUsername = (
  longName: string | undefined,
  ownNodeId: number,
  from: number,
): { displayText: string; isSelf: boolean } => {
  if (from === 0 || from === ownNodeId) {
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
  if (numMessages === 1) return i18next.t("messaging.oneMessage");
  return i18next.t("messaging.manyMessages", { numMessages });
};

export const getWaypointTitle = (
  waypoint: app_device_NormalizedWaypoint,
): string => {
  if (waypoint.name) return waypoint.name;
  return i18next.t("messaging.unnamedWaypoint");
};

export const getPacketDisplayText = ({
  data,
  type,
}: app_device_ChannelMessagePayload) => {
  if (type === "text") return data;
  const { latitude, longitude } = data;
  return i18next.t("messaging.waypointInfo", {
    title: getWaypointTitle(data),
    latitude: formatLocation(latitude),
    longitude: formatLocation(longitude),
  });
};

export const getLastChannelMessageDisplayText = (
  lastMessage: app_device_ChannelMessageWithState | null,
) => {
  if (lastMessage?.payload.type) {
    return getPacketDisplayText(lastMessage.payload);
  }

  return i18next.t("messaging.noMessages");
};
