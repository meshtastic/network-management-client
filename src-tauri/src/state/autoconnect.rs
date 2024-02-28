use std::sync::Arc;
use tauri::async_runtime;

use super::DeviceKey;

pub type AutoConnectStateInner = Arc<async_runtime::Mutex<Option<DeviceKey>>>;

#[derive(Debug)]
pub struct AutoConnectState {
    pub inner: AutoConnectStateInner,
}

impl AutoConnectState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(async_runtime::Mutex::new(None)),
        }
    }

    pub fn init(initial_value: DeviceKey) -> Self {
        Self {
            inner: Arc::new(async_runtime::Mutex::new(Some(initial_value))),
        }
    }
}
