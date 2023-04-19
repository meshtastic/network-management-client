use std::{error::Error, fmt};

mod from_radio;
mod mesh_packet;

#[derive(Clone, Debug, Default)]
pub struct NotificationConfig {
    pub title: String,
    pub body: String,
}

impl NotificationConfig {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
}

#[derive(Clone, Debug, Default)]
pub struct DeviceUpdateMetadata {
    pub device_updated: bool,
    pub regenerate_graph: bool,
    pub configuration_success: bool,
    pub notification_config: Option<NotificationConfig>,
}

impl DeviceUpdateMetadata {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
}

#[derive(Clone, Debug)]
pub enum DeviceUpdateError {
    PacketNotSupported(String),
    RadioMessageNotSupported(String),
    DecodeFailure(prost::DecodeError),
    GeneralFailure(String),
}

impl fmt::Display for DeviceUpdateError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("Failed to update device: ")?;

        match *self {
            DeviceUpdateError::DecodeFailure(ref decode_error) => {
                f.write_fmt(format_args!("failed to decode packet:\n{}", decode_error))?;
            }
            DeviceUpdateError::PacketNotSupported(ref packet_type) => {
                f.write_fmt(format_args!(
                    "packet of type \"{}\" not supported",
                    packet_type
                ))?;
            }
            DeviceUpdateError::RadioMessageNotSupported(ref message_type) => {
                f.write_fmt(format_args!(
                    "radio message of type \"{}\" not supported",
                    message_type
                ))?;
            }
            DeviceUpdateError::GeneralFailure(ref failure_reason) => {
                f.write_fmt(format_args!(
                    "General device update failure:\n{}",
                    failure_reason
                ))?;
            }
        }

        Ok(())
    }
}

impl Error for DeviceUpdateError {}
