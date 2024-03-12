use meshtastic::api::ConnectedStreamApi;
use std::{collections::HashMap, sync::Arc};
use tauri::async_runtime;

use super::DeviceKey;

pub type RadioConnectionsStateInner =
    Arc<async_runtime::Mutex<HashMap<DeviceKey, ConnectedStreamApi>>>;

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
