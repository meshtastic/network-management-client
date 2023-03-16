use crate::{analytics, mesh};
use std::sync::Arc;
use tauri::async_runtime;

pub struct ActiveSerialConnection {
    pub inner: Arc<async_runtime::Mutex<Option<mesh::serial_connection::SerialConnection>>>,
}

pub struct ActiveMeshDevice {
    pub inner: Arc<async_runtime::Mutex<Option<mesh::device::MeshDevice>>>,
}

pub struct ActiveMeshGraph {
    pub inner: Arc<async_runtime::Mutex<Option<mesh::device::MeshGraph>>>,
}

pub struct ActiveMeshState {
    pub inner: Arc<async_runtime::Mutex<Option<analytics::state::State>>>,
}
