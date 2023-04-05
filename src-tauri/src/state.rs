use crate::{analytics, mesh};
use std::sync::Arc;
use tauri::async_runtime;

#[derive(Debug)]
pub struct ActiveSerialConnection {
    pub inner: Arc<async_runtime::Mutex<Option<mesh::serial_connection::SerialConnection>>>,
}

#[derive(Debug)]
pub struct ActiveMeshDevice {
    pub inner: Arc<async_runtime::Mutex<Option<mesh::device::MeshDevice>>>,
}

#[derive(Debug)]
pub struct NetworkGraph {
    pub inner: Arc<async_runtime::Mutex<Option<mesh::device::MeshGraph>>>,
}

pub struct AnalyticsState {
    pub inner: Arc<async_runtime::Mutex<Option<analytics::state::AnalyticsState>>>,
}

#[derive(Debug)]
pub struct AutoConnectState {
    pub inner: Arc<async_runtime::Mutex<Option<String>>>,
}
