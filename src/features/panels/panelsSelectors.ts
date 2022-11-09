import type { RootState } from "@app/store";

export const selectActiveSidebarPanel = () => (state: RootState) =>
  state.panels.activeSidebarPanel;
