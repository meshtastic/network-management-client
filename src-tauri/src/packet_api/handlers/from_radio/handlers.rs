use log::debug;
use meshtastic::protobufs;

use crate::{
    device::{helpers::get_current_time_u32, MeshChannel, SerialDeviceStatus},
    ipc::{events, ConfigurationStatus},
    packet_api::{handlers::DeviceUpdateError, MeshPacketApi},
};

pub fn handle_channel_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    channel: protobufs::Channel,
) -> Result<(), DeviceUpdateError> {
    packet_api.device.add_channel(MeshChannel {
        config: channel,
        last_interaction: get_current_time_u32(),
        messages: vec![],
    });

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::EventDispatchFailure(e.to_string()))?;

    Ok(())
}

pub fn handle_config_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    config: protobufs::Config,
) -> Result<(), DeviceUpdateError> {
    packet_api.device.set_config(config);

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::EventDispatchFailure(e.to_string()))?;

    Ok(())
}

pub fn handle_module_config_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    module_config: protobufs::ModuleConfig,
) -> Result<(), DeviceUpdateError> {
    packet_api.device.set_module_config(module_config);

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::EventDispatchFailure(e.to_string()))?;

    Ok(())
}

pub fn handle_config_complete_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,
) -> Result<(), DeviceUpdateError> {
    packet_api.device.set_status(SerialDeviceStatus::Configured);

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::EventDispatchFailure(e.to_string()))?;

    if packet_api.device.status == SerialDeviceStatus::Configured {
        debug!(
            "Emitting successful configuration of device \"{}\"",
            packet_api.device_key.clone()
        );

        events::dispatch_configuration_status(
            &packet_api.app_handle,
            ConfigurationStatus {
                device_key: packet_api.device_key.clone(),
                successful: true,
                message: None,
            },
        )
        .map_err(|e| DeviceUpdateError::EventDispatchFailure(e.to_string()))?;

        packet_api.device.set_status(SerialDeviceStatus::Connected);
    }

    Ok(())
}

pub fn handle_my_node_info_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,

    my_node_info: protobufs::MyNodeInfo,
) -> Result<(), DeviceUpdateError> {
    packet_api.device.set_my_node_info(my_node_info);

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::EventDispatchFailure(e.to_string()))?;

    Ok(())
}

pub fn handle_node_info_packet<R: tauri::Runtime>(
    packet_api: &mut MeshPacketApi<R>,
    node_info: protobufs::NodeInfo,
) -> Result<(), DeviceUpdateError> {
    packet_api.device.add_node_info(node_info.clone());

    let mut graph = packet_api
        .get_locked_graph()
        .map_err(|e| DeviceUpdateError::GeneralFailure(e.to_string()))?;

    graph.update_from_node_info(node_info);

    events::dispatch_updated_device(&packet_api.app_handle, &packet_api.device)
        .map_err(|e| DeviceUpdateError::EventDispatchFailure(e.to_string()))?;

    events::dispatch_updated_graph(&packet_api.app_handle, graph.clone())
        .map_err(|e| DeviceUpdateError::EventDispatchFailure(e.to_string()))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    // * Integration test converage within `mod.rs`
}
