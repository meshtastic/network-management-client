import type { INode } from "@features/device/deviceSlice";

// TODO these will need to be configurable
export const NODE_WARNING_THRESHOLD = 15;
export const NODE_ERROR_THRESHOLD = 30;

export type NodeState = "nominal" | "selected" | "warning" | "error";

export const getTimeSinceLastMessage = (node: INode): number => {
  const lastHeard =
    node.data.lastHeard !== 0 ? node.data.lastHeard : Date.now(); // sec, 0 means not set
  const now = Date.now() / 1000; // sec
  const timeSinceLastMessage = Math.abs(now - lastHeard) / 60; // s to min

  return Math.floor(timeSinceLastMessage);
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

export const getHeadingFromNodeState = (
  nodeState: NodeState,
  isBase = false
): string => {
  if (isBase) return "Base";

  switch (nodeState) {
    case "selected":
      return "Selected";

    case "warning":
      return "Warning";

    case "error":
      return "Error";

    // Nominal
    default:
      return "";
  }
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
        text: "text-blue-500",
        fill: "fill-blue-500",
        background: "bg-blue-500",
        border: "border-blue-500",
      };

    case "warning":
      return {
        text: "text-orange-500",
        fill: "fill-orange-500",
        background: "bg-orange-500",
        border: "border-orange-500",
      };

    case "error":
      return {
        text: "text-red-500",
        fill: "fill-red-500",
        background: "bg-red-500",
        border: "border-red-500",
      };

    // Nominal
    default:
      return {
        text: "text-gray-500",
        fill: "fill-gray-500",
        background: "bg-gray-500",
        border: "border-gray-500",
      };
  }
};
