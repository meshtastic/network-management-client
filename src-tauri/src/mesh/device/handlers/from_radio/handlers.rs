use app::protobufs;

use crate::mesh::device::{
    handlers::{DeviceUpdateError, DeviceUpdateMetadata},
    helpers::get_current_time_u32,
    MeshChannel, MeshDevice, SerialDeviceStatus,
};

pub fn handle_channel_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    channel: protobufs::Channel,
) -> Result<(), DeviceUpdateError> {
    device.add_channel(MeshChannel {
        config: channel,
        last_interaction: get_current_time_u32(),
        messages: vec![],
    });

    update_result.device_updated = true;

    Ok(())
}

pub fn handle_config_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    config: protobufs::Config,
) -> Result<(), DeviceUpdateError> {
    device.set_config(config);
    update_result.device_updated = true;

    Ok(())
}

pub fn handle_config_complete_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
) -> Result<(), DeviceUpdateError> {
    device.set_status(SerialDeviceStatus::Configured);

    update_result.device_updated = true;
    update_result.configuration_success = true;

    Ok(())
}

pub fn handle_my_node_info_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    my_node_info: protobufs::MyNodeInfo,
) -> Result<(), DeviceUpdateError> {
    device.set_my_node_info(my_node_info);
    update_result.device_updated = true;

    Ok(())
}

pub fn handle_node_info_packet(
    device: &mut MeshDevice,
    update_result: &mut DeviceUpdateMetadata,
    node_info: protobufs::NodeInfo,
) -> Result<(), DeviceUpdateError> {
    device.add_node_info(node_info);
    update_result.device_updated = true;

    Ok(())
}

#[cfg(test)]
mod tests {
    // * Integration test converage within `mod.rs`
}
