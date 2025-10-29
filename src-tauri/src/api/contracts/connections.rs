use serde::{Deserialize, Serialize};
use specta::Type;

use crate::{
    api::primitives::connections::{BluetoothConnectionCandidate, SerialPortConnectionCandidate},
    state::DeviceKey,
};

// Request autoconnect port
// NOTE: Not sure if this is used

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct RequestAutoconnectPortRequest {} // Empty

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct RequestAutoconnectPortResponse {
    pub port: String,
}

// Get all available Bluetooth devices

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GetAllBluetoothRequest {} // Empty

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GetAllBluetoothResponse {
    pub candidates: Vec<BluetoothConnectionCandidate>,
}

// Get all available serial ports

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GetAllSerialPortsRequest {} // Empty

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GetAllSerialPortsResponse {
    pub ports: Vec<SerialPortConnectionCandidate>,
}

// Connect to Bluetooth device

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ConnectToBluetoothRequest {
    pub bluetooth_name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ConnectToBluetoothResponse {} // Empty

// Connect to serial port

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ConnectToSerialPortRequest {
    pub port_name: String,
    pub baud_rate: Option<u32>,
    pub dtr: Option<bool>,
    pub rts: Option<bool>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ConnectToSerialPortResponse {} // Empty

// Connect to TCP port

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ConnectToTcpPortRequest {
    pub address: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ConnectToTcpPortResponse {} // Empty

// Drop connection to device

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DropDeviceConnectionRequest {
    pub device_key: DeviceKey,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DropDeviceConnectionResponse {} // Empty

// Drop all device connections
// NOTE: Not sure if this is used

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DropAllDeviceConnectionsRequest {} // Empty

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DropAllDeviceConnectionsResponse {} // Empty
