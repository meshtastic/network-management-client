import type { RootState } from "@app/store";
import type { ChannelMessageWithAck } from "@bindings/ChannelMessageWithAck";
import type { MeshDevice } from "@bindings/MeshDevice";
import type { MeshNode } from "@bindings/MeshNode";

export const selectDevice =
  () =>
  (state: RootState): MeshDevice | null =>
    state.devices.device;

export const selectAllNodes =
  () =>
  (state: RootState): MeshNode[] =>
    Object.values(state.devices.device?.nodes ?? []);

export const selectNodeById =
  (id: number) =>
  (state: RootState): MeshNode | null => {
    for (const node of selectAllNodes()(state)) {
      if (node.data.num === id) return node;
    }

    return null;
  };

export const selectActiveNodeId = () => (state: RootState) =>
  state.devices.activeNode;

export const selectActiveNode =
  () =>
  (state: RootState): MeshNode | null => {
    const activeNodeId = selectActiveNodeId()(state);
    if (!activeNodeId) return null;
    return selectNodeById(activeNodeId)(state);
  };

export const selectMessagesByChannel =
  (channelId: number) =>
  (state: RootState): ChannelMessageWithAck[] => {
    const numChannels = Object.values(
      state.devices.device?.channels ?? {}
    ).length;

    if (!numChannels || channelId < 0 || numChannels <= channelId) return [];
    return state.devices.device?.channels[channelId].messages ?? [];
  };
