import type { RootState } from "@app/store";
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

export const selectActiveNode = () => (state: RootState) =>
  state.devices.activeNode;
