import type { app_device_MeshNode } from "@bindings/index";

export const NODE_WARNING_THRESHOLD = 15;
export const NODE_ERROR_THRESHOLD = 30;

export type NodeState = "nominal" | "selected" | "warning" | "error";

/**
 * Get the last heard time of a node in seconds
 * @param node Node to get last heard time from
 * @returns Last heard time in seconds
 */
export const getLastHeardTime = (node: app_device_MeshNode): number | null => {
  const lastDeviceMetricTimestamp = node.deviceMetrics.at(-1)?.timestamp; // s

  const lastEnvironmentMetricTimestamp =
    node.environmentMetrics.at(-1)?.timestamp; // s

  const lastDataTimestamp = node.lastHeard?.timestamp; // s

  const lastHeard = Math.max(
    lastDeviceMetricTimestamp ?? 0,
    lastEnvironmentMetricTimestamp ?? 0,
    lastDataTimestamp ?? 0
  );

  if (lastHeard === 0) return null;
  return lastHeard;
};

export const getMinsSinceLastHeard = (node: app_device_MeshNode): number => {
  const lastHeard = getLastHeardTime(node);
  if (!lastHeard) return 0; // 0 means not set

  const now = Date.now(); // ms
  const timeSinceLastMessage = Math.abs(now / 1000 - lastHeard) / 60; // s to min

  return timeSinceLastMessage;
};

export const getNodeState = (
  timeSinceLastMessage: number,
  selected: boolean
): NodeState => {
  if (selected) return "selected";
  if (timeSinceLastMessage >= NODE_ERROR_THRESHOLD) return "error";
  if (timeSinceLastMessage >= NODE_WARNING_THRESHOLD) return "warning";
  return "nominal";
};

export type NodeColorStyleConfig = {
  text: string;
  fill: string;
  background: string;
  border: string;
};

export const getColorClassFromNodeState = (
  nodeState: NodeState
): NodeColorStyleConfig => {
  switch (nodeState) {
    case "selected":
      return {
        text: "text-blue-500 dark:text-blue-300",
        fill: "fill-blue-500 dark:text-blue-300",
        background: "bg-blue-500 dark:bg-blue-300",
        border: "border-blue-500 dark:border-blue-300",
      };

    case "warning":
      return {
        text: "text-orange-500 dark:text-orange-300",
        fill: "fill-orange-500 dark:text-orange-300",
        background: "bg-orange-500 dark:bg-orange-300",
        border: "border-orange-500 dark:border-orange-300",
      };

    case "error":
      return {
        text: "text-red-500 dark:text-red-300",
        fill: "fill-red-500 dark:text-red-300",
        background: "bg-red-500 dark:bg-red-300",
        border: "border-red-500 dark:border-red-300",
      };

    // Nominal
    default:
      return {
        text: "text-gray-500 dark:text-gray-400",
        fill: "fill-gray-500 dark:text-gray-400",
        background: "bg-gray-500 dark:bg-gray-400",
        border: "border-gray-500 dark:border-gray-400",
      };
  }
};
