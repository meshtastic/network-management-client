import type { RootState } from "@app/store";
import { Protobuf } from "@meshtastic/meshtasticjs";
import type { IDevice, INode } from "@features/device/deviceSlice";

export const selectAllDevices =
  () =>
  (state: RootState): IDevice[] =>
    Object.values(state.devices.devices);

export const selectDeviceById =
  (id: number) =>
  (state: RootState): IDevice | null =>
    state.devices.devices[id] ?? null;

export const selectAllNodes =
  () =>
  (state: RootState): INode[] =>
    Object.values(state.devices.devices).reduce<INode[]>(
      (accum, curr) => [...accum, ...Object.values(curr.nodes)],
      []
    );

export const selectNodeById =
  (id: number) =>
  (state: RootState): INode | null => {
    const devices = state.devices.devices;

    for (const device of Object.values(devices)) {
      for (const node of Object.values(device.nodes)) {
        if (node.data.num === id) return node;
      }
    }

    return null;
  };

export const selectActiveNodeId = () => (state: RootState) =>
  state.devices.activeNode;

export const selectActiveNode =
  () =>
  (state: RootState): INode | null => {
    const activeNodeId = selectActiveNodeId()(state);
    if (!activeNodeId) return null;
    return selectNodeById(activeNodeId)(state);
  };

export type MessageType = { message: string; userName: string; time: Date };

export const selectMessagesByDeviceId =
  (id: number) =>
  (state: RootState): MessageType[] => {
    const device = state.devices.devices[id];
    if (!device) return [];

    const decoder = new TextDecoder();

    return device.meshPackets.reduce((accum, m) => {
      if (
        !("decoded" in m.payloadVariant) ||
        m.payloadVariant?.decoded?.portnum !== Protobuf.PortNum.TEXT_MESSAGE_APP
      )
        return accum;

      return [
        ...accum,
        {
          message: decoder.decode(
            new Uint8Array(m.payloadVariant.decoded.payload)
          ),
          userName: m.from.toString(),
          time: new Date(m.rxTime ?? 0),
        },
      ];
    }, [] as MessageType[]);
  };
