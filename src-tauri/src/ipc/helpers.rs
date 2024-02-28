use std::time::Duration;

use log::{debug, trace, warn};
use meshtastic::packet::PacketRouter;
use meshtastic::protobufs;
use tokio::sync::mpsc::UnboundedReceiver;

use crate::device::SerialDeviceStatus;
use crate::ipc::events::dispatch_configuration_status;
use crate::ipc::ConfigurationStatus;
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
        )
        .expect("Failed to dispatch configuration status");

        trace!("Told UI to disconnect device");
    });
}

pub fn spawn_decoded_handler(
    mut decoded_listener: UnboundedReceiver<protobufs::FromRadio>,
    connected_devices_arc: state::mesh_devices::MeshDevicesStateInner,
    device_key: DeviceKey,
) {
    tauri::async_runtime::spawn(async move {
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

            match packet_api.handle_packet_from_radio(packet) {
                Ok(result) => result,
                Err(err) => {
                    warn!("{}", err);
                    continue;
                }
            };
        }
    });
}
