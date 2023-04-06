use super::super::{helpers::get_current_time_u32, DeviceUpdateResult, MeshChannel, MeshDevice};
use app::protobufs;

impl MeshDevice {
    pub fn handle_packet_from_radio(
        &mut self,
        variant: protobufs::from_radio::PayloadVariant,
    ) -> Result<DeviceUpdateResult, String> {
        let mut update_result = DeviceUpdateResult::new();

        match variant {
            protobufs::from_radio::PayloadVariant::Channel(c) => {
                self.add_channel(MeshChannel {
                    config: c,
                    last_interaction: get_current_time_u32(),
                    messages: vec![],
                });

                update_result.device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::Config(c) => {
                self.set_config(c);
                update_result.device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::ConfigCompleteId(_c) => {
                // println!("Config complete id data: {:#?}", c);
            }
            protobufs::from_radio::PayloadVariant::LogRecord(_l) => {
                // println!("Log record data: {:#?}", l);
            }
            protobufs::from_radio::PayloadVariant::ModuleConfig(_m) => {
                // println!("Module config data: {:#?}", m);
            }
            protobufs::from_radio::PayloadVariant::MyInfo(m) => {
                self.set_my_node_info(m);
                update_result.device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::NodeInfo(n) => {
                self.add_node_info(n);
                update_result.device_updated = true;
            }
            protobufs::from_radio::PayloadVariant::Packet(p) => {
                update_result = self.handle_mesh_packet(p)?;
            }
            protobufs::from_radio::PayloadVariant::QueueStatus(_q) => {
                // println!("Queue status data: {:#?}", q);
            }
            protobufs::from_radio::PayloadVariant::Rebooted(_r) => {
                // println!("Rebooted data: {:#?}", r);
            }
            protobufs::from_radio::PayloadVariant::XmodemPacket(_p) => {
                // println!("Xmodem packet: {:#?}", p);
            }
        };

        Ok(update_result)
    }
}

#[cfg(test)]
mod tests {
    use crate::mesh;

    use super::*;

    fn initialize_mock_device() -> mesh::device::MeshDevice {
        mesh::device::MeshDevice::new()
    }

    #[test]
    fn test_add_and_update_channel() {
        // Set channel in device storage

        let channel1 = protobufs::Channel {
            index: 1,
            role: protobufs::channel::Role::Secondary.into(),
            settings: None,
        };

        let variant1 = protobufs::from_radio::PayloadVariant::Channel(channel1);

        let mut device = initialize_mock_device();
        let result1 = device.handle_packet_from_radio(variant1).unwrap();

        // Assert channel initialized correctly

        assert!(result1.device_updated);
        assert!(!result1.regenerate_graph);
        assert!(result1.notification_config.is_none());

        assert!(device.channels.get(&1).is_some());
        assert_eq!(
            device.channels.get(&1).unwrap().config.role,
            protobufs::channel::Role::Secondary as i32
        );

        // Update channel in device state

        let channel2 = protobufs::Channel {
            index: 1,
            role: protobufs::channel::Role::Primary.into(),
            settings: None,
        };

        let variant2 = protobufs::from_radio::PayloadVariant::Channel(channel2);
        let _result2 = device.handle_packet_from_radio(variant2).unwrap();

        // Assert channel updated correctly

        assert!(device.channels.get(&1).is_some());
        assert_eq!(
            device.channels.get(&1).unwrap().config.role,
            protobufs::channel::Role::Primary as i32
        );
    }

    #[test]
    fn test_set_config() {
        let display_config = protobufs::config::DisplayConfig {
            ..Default::default()
        };

        let config_packet = protobufs::Config {
            payload_variant: Some(protobufs::config::PayloadVariant::Display(display_config)),
        };

        let variant = protobufs::from_radio::PayloadVariant::Config(config_packet);

        let mut device = initialize_mock_device();
        let result = device.handle_packet_from_radio(variant).unwrap();

        assert!(result.device_updated);
        assert!(!result.regenerate_graph);
        assert!(result.notification_config.is_none());

        assert!(device.config.display.is_some());
    }

    #[test]
    fn test_set_my_node_info() {
        let my_node_info = protobufs::MyNodeInfo {
            max_channels: 12,
            ..Default::default()
        };

        let variant = protobufs::from_radio::PayloadVariant::MyInfo(my_node_info);

        let mut device = initialize_mock_device();
        let result = device.handle_packet_from_radio(variant).unwrap();

        assert!(result.device_updated);
        assert!(!result.regenerate_graph);
        assert!(result.notification_config.is_none());

        assert_eq!(device.my_node_info.max_channels, 12);
    }

    #[test]
    fn test_set_node_info() {
        // Set NodeInfo in device storage

        let node_info1 = protobufs::NodeInfo {
            num: 1,
            last_heard: 1500,
            ..Default::default()
        };

        let variant1 = protobufs::from_radio::PayloadVariant::NodeInfo(node_info1);

        let mut device = initialize_mock_device();
        let result1 = device.handle_packet_from_radio(variant1).unwrap();

        // Assert NodeInfo initialized correctly

        assert!(result1.device_updated);
        assert!(!result1.regenerate_graph);
        assert!(result1.notification_config.is_none());

        assert!(device.nodes.get(&1).is_some());
        assert_eq!(device.nodes.get(&1).unwrap().data.last_heard, 1500);

        // Update NodeInfo in device state

        let node_info2 = protobufs::NodeInfo {
            num: 1,
            last_heard: 2000,
            ..Default::default()
        };

        let variant2 = protobufs::from_radio::PayloadVariant::NodeInfo(node_info2);
        let _result2 = device.handle_packet_from_radio(variant2).unwrap();

        // Assert NodeInfo updated correctly

        assert!(device.nodes.get(&1).is_some());
        assert_eq!(device.nodes.get(&1).unwrap().data.last_heard, 2000);
    }

    // #[test]
    // fn test_handle_mesh_packet() {}
}
