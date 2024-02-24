use meshtastic::connections::stream_api::{state::Configured, StreamApi};
use std::{collections::HashMap, sync::Arc};
use tauri::async_runtime;

use super::DeviceKey;

pub type RadioConnectionsStateInner =
    Arc<async_runtime::Mutex<HashMap<DeviceKey, StreamApi<Configured>>>>;

pub struct RadioConnectionsState {
    pub inner: RadioConnectionsStateInner,
}

impl RadioConnectionsState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(async_runtime::Mutex::new(HashMap::new())),
        }
    }
}
