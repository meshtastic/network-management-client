import { load } from "@tauri-apps/plugin-store";
import { DEFAULT_STORE_FILE_NAME } from "@utils/persistence";

export const defaultStore = await load(DEFAULT_STORE_FILE_NAME, {
  autoSave: false,
});
