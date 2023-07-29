use crate::{
    analytics,
    device::{self, connections::MeshConnection},
};
use std::{collections::HashMap, sync::Arc};
use tauri::async_runtime;

pub type DeviceKey = String; // "COM3" or "localhost:4403"
pub type NodeKey = u32; // Node number

pub type MeshDevicesInner = Arc<async_runtime::Mutex<HashMap<DeviceKey, device::MeshDevice>>>;

#[derive(Debug)]
pub struct MeshDevices {
    pub inner: MeshDevicesInner,
}

pub type RadioConnectionsInner =
    Arc<async_runtime::Mutex<HashMap<DeviceKey, Box<dyn MeshConnection + Send + Sync>>>>;

pub struct RadioConnections {
    pub inner: RadioConnectionsInner,
}

pub type NetworkGraphInner = Arc<async_runtime::Mutex<Option<device::MeshGraph>>>;

#[derive(Debug)]
pub struct NetworkGraph {
    pub inner: NetworkGraphInner,
}

pub type AnalyticsStateInner = Arc<async_runtime::Mutex<Option<analytics::state::AnalyticsState>>>;

pub struct AnalyticsState {
    pub inner: AnalyticsStateInner,
}

pub type AutoConnectStateInner = Arc<async_runtime::Mutex<Option<DeviceKey>>>;

#[derive(Debug)]
pub struct AutoConnectState {
    pub inner: AutoConnectStateInner,
}
