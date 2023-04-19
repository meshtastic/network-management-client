use crate::{analytics, device};
use std::{collections::HashMap, sync::Arc};
use tauri::async_runtime;

pub type ConnectedDevicesInner = Arc<async_runtime::Mutex<HashMap<String, device::MeshDevice>>>;

#[derive(Debug)]
pub struct ConnectedDevices {
    pub inner: ConnectedDevicesInner,
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

pub type AutoConnectStateInner = Arc<async_runtime::Mutex<Option<String>>>;

#[derive(Debug)]
pub struct AutoConnectState {
    pub inner: AutoConnectStateInner,
}
