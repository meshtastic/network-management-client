use std::{collections::HashMap, sync::Arc};
use tauri::async_runtime;

use crate::packet_api::MeshPacketApi;

use super::DeviceKey;

pub type MeshDevicesStateInner = Arc<async_runtime::Mutex<HashMap<DeviceKey, MeshPacketApi>>>;

pub struct MeshDevicesState {
    pub inner: MeshDevicesStateInner,
}

impl MeshDevicesState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(async_runtime::Mutex::new(HashMap::new())),
        }
    }
}
