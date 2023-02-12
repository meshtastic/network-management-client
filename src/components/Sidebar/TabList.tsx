import React from "react";
import {
  // Overview
  MapIcon,
  ChatBubbleBottomCenterTextIcon,
  // Network
  CircleStackIcon,
  MapPinIcon,
  // Config
  RadioIcon,
  CubeIcon,
  EnvelopeIcon,
  // Settings
  DocumentArrowDownIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

import type { iconInfo, tabGroup } from "@components/Sidebar/RenderTabs";

// This file contains:
//    1. A iconInfo type formatting of all of the pages that appear as tabs on the sidebar
//    2. All of the tab groups (e.g. Management, Settings, etc.)

// 1. Pages:
//// Overview
const viewMap: iconInfo = {
  name: "View Map",
  pathname: "/",
  icon: <MapIcon />,
};
const messaging: iconInfo = {
  name: "Messaging",
  pathname: "/messaging",
  icon: <ChatBubbleBottomCenterTextIcon />,
};

//// Network
const manageNodes: iconInfo = {
  name: "Manage Nodes",
  pathname: "/TODO",
  icon: <CircleStackIcon />,
};
const manageWaypoints: iconInfo = {
  name: "Manage Waypoints",
  pathname: "/TODO",
  icon: <MapPinIcon />,
};

//// CONFIGURATION
const radioConfig: iconInfo = {
  name: "Radio Configuration",
  pathname: "/config/radio",
  icon: <RadioIcon />,
};
const pluginConfig: iconInfo = {
  name: "Plugin Configuration",
  pathname: "/config/plugin",
  icon: <CubeIcon />,
};
const channelConfig: iconInfo = {
  name: "Channel Configuration",
  pathname: "/config/channel",
  icon: <EnvelopeIcon />,
};

//// SETTINGS
const exportData: iconInfo = {
  name: "Export Data",
  pathname: "/TODO",
  icon: <DocumentArrowDownIcon />,
};
const appSettings: iconInfo = {
  name: "Application Settings",
  pathname: "/settings",
  icon: <Cog8ToothIcon />,
};

// 2. Tab Groups
export const overviewGroup: tabGroup = {
  title: "Overview",
  tabs: [viewMap, messaging],
};
export const networkGroup: tabGroup = {
  title: "Network",
  tabs: [manageNodes, manageWaypoints],
};
export const configGroup: tabGroup = {
  title: "Configuration",
  tabs: [radioConfig, pluginConfig, channelConfig],
};
export const settingsGroup: tabGroup = {
  title: "Settings",
  tabs: [exportData, appSettings],
};
