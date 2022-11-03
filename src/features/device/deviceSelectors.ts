import type { RootState } from "@app/store";
import type { IDevice } from "@features/device/deviceSlice";

export const selectAllDevices =
  () =>
  (state: RootState): IDevice[] =>
    Object.values(state.devices.devices);

export const selectDeviceById =
  (id: number) =>
  (state: RootState): IDevice | null =>
    state.devices.devices[id] ?? null;
