use crate::{analytics, device};
use std::sync::Arc;
use tauri::async_runtime;

#[derive(Debug)]
pub struct ActiveMeshDevice {
    pub inner: Arc<async_runtime::Mutex<Option<device::MeshDevice>>>,
}

#[derive(Debug)]
pub struct NetworkGraph {
    pub inner: Arc<async_runtime::Mutex<Option<device::MeshGraph>>>,
}

pub struct AnalyticsState {
    pub inner: Arc<async_runtime::Mutex<Option<analytics::state::AnalyticsState>>>,
}

#[derive(Debug)]
pub struct AutoConnectState {
    pub inner: Arc<async_runtime::Mutex<Option<String>>>,
}
