import { writeText } from "@tauri-apps/api/clipboard";

export const writeValueToClipboard = async (value: string) => {
  await writeText(value);
};
