use std::time::Duration;

use log::{debug, error, trace, warn};
use meshtastic::connections::PacketRouter;
use meshtastic::protobufs;
use tauri::api::notification::Notification;
use tokio::sync::mpsc::UnboundedReceiver;

use crate::device::SerialDeviceStatus;
use crate::ipc::events::{dispatch_configuration_status, dispatch_rebooting_event};
use crate::ipc::{events, ConfigurationStatus};
use crate::state::{self, DeviceKey};

pub fn spawn_configuration_timeout_handler(
    handle: tauri::AppHandle,
    connected_devices_inner: state::mesh_devices::MeshDevicesStateInner,
    device_key: DeviceKey,
    timeout: Duration,
) {
    trace!("Spawning device configuration timeout");

    tauri::async_runtime::spawn(async move {
        // Wait for device to configure
        tokio::time::sleep(timeout).await;

        trace!("Device configuration timeout completed");

        let mut devices_guard = connected_devices_inner.lock().await;
        let packet_api = match devices_guard
            .get_mut(&device_key)
            .ok_or("Device not initialized")
        {
            Ok(d) => d,
            Err(e) => {
                warn!("{}", e);
                return;
            }
        };

        // If the device is not registered as configuring, take no action
        // since this means the device configuration has succeeded

        if packet_api.device.status != SerialDeviceStatus::Configuring {
            return;
        }

        // If device hasn't completed configuration in allotted time,
        // tell the UI layer that the configuration failed

        warn!("Device configuration timed out, telling UI to disconnect device");

        dispatch_configuration_status(
            &handle,
            ConfigurationStatus {
                device_key,
                successful: false,
                message: Some(
                    "Configuration timed out. Are you sure this is a Meshtastic device?".into(),
                ),
            },
        );

        trace!("Told UI to disconnect device");
    });
}

pub fn spawn_decoded_handler(
    handle: tauri::AppHandle,
    mut decoded_listener: UnboundedReceiver<protobufs::FromRadio>,
    connected_devices_arc: state::mesh_devices::MeshDevicesStateInner,
    device_key: DeviceKey,
) {
    tauri::async_runtime::spawn(async move {
        let handle = handle;

        while let Some(packet) = decoded_listener.recv().await {
            debug!("Received packet from device: {:?}", packet);

            let mut devices_guard = connected_devices_arc.lock().await;
            let packet_api = match devices_guard
                .get_mut(&device_key)
                .ok_or("Device not initialized")
            {
                Ok(d) => d,
                Err(e) => {
                    warn!("{}", e);
                    continue;
                }
            };

            let update_result = match packet_api.handle_packet_from_radio(packet) {
                Ok(result) => result,
                Err(err) => {
                    warn!("{}", err);
                    continue;
                }
            };

            if update_result.device_updated {
                match events::dispatch_updated_device(&handle, &packet_api.device) {
                    Ok(_) => (),
                    Err(e) => {
                        error!("Failed to dispatch device to client:\n{}", e);
                        continue;
                    }
                };
            }

            if update_result.regenerate_graph {
                log::warn!("Graph regeneration not implemented");
            }

            if update_result.configuration_success
                && packet_api.device.status == SerialDeviceStatus::Configured
            {
                debug!(
                    "Emitting successful configuration of device \"{}\"",
                    device_key.clone()
                );

                dispatch_configuration_status(
                    &handle,
                    ConfigurationStatus {
                        device_key: device_key.clone(),
                        successful: true,
                        message: None,
                    },
                );

                packet_api.device.set_status(SerialDeviceStatus::Connected);
            }

            if let Some(notification_config) = update_result.notification_config {
                match Notification::new(handle.config().tauri.bundle.identifier.clone())
                    .title(notification_config.title)
                    .body(notification_config.body)
                    .notify(&handle)
                {
                    Ok(_) => (),
                    Err(e) => {
                        error!("Failed to send system-level notification:\n{}", e);
                        continue;
                    }
                }
            }

            if update_result.rebooting {
                debug!("Device rebooting");
                dispatch_rebooting_event(&handle);
            }
        }
    });
}
