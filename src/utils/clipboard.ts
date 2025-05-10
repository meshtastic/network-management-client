import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export const writeValueToClipboard = async (value: string) => {
  await writeText(value);
};
