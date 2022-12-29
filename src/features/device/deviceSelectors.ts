import type { RootState } from "@app/store";
import type { ChannelMessageWithAck } from "@bindings/ChannelMessageWithAck";
import type { MeshDevice } from "@bindings/MeshDevice";
import type { MeshNode } from "@bindings/MeshNode";
import type { User } from "@bindings/protobufs/User";

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
    const numChannels = state.devices.device?.hardwareInfo.maxChannels ?? 0;
    if (!numChannels || channelId < 0 || numChannels <= channelId) return [];
    return state.devices.device?.channels[channelId].messages ?? [];
  };

export const selectAllUsersByNodeIds =
  () =>
  (state: RootState): Record<number, User | null> =>
    selectAllNodes()(state).reduce((accum, n) => {
      const user = n.data.user;
      return user ? { ...accum, [n.data.num]: user } : accum;
    }, [] as User[]);

export const selectUserByNodeId =
  (nodeId: number) =>
  (state: RootState): User | null =>
    selectNodeById(nodeId)(state)?.data.user ?? null;
