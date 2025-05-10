import { Store } from "@tauri-apps/plugin-store";
import { DEFAULT_STORE_FILE_NAME } from "@utils/persistence";

export const defaultStore = new Store(DEFAULT_STORE_FILE_NAME);
