pub mod handlers;

#[cfg(test)]
mod tests {
    use crate::device::{
        self,
        helpers::{generate_rand_id, get_current_time_u32},
    };

    use meshtastic::{connections::PacketRouter, protobufs};

    fn initialize_mock_device() -> device::MeshDevice {
        device::MeshDevice::new()
    }

    fn generate_mock_fromradio_packet(
        variant: protobufs::from_radio::PayloadVariant,
    ) -> protobufs::FromRadio {
        protobufs::FromRadio {
            id: generate_rand_id(),
            payload_variant: Some(variant),
        }
    }

    #[test]
    fn set_and_update_channel() {
        // Set channel in device storage

        let channel1 = protobufs::Channel {
            index: 1,
            role: protobufs::channel::Role::Secondary.into(),
            settings: None,
        };

        let variant1 = protobufs::from_radio::PayloadVariant::Channel(channel1);

        let mut device = initialize_mock_device();
        let result1 = device
            .handle_packet_from_radio(generate_mock_fromradio_packet(variant1))
            .unwrap();

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
        let _result2 = device
            .handle_packet_from_radio(generate_mock_fromradio_packet(variant2))
            .unwrap();

        // Assert channel updated correctly

        assert!(device.channels.get(&1).is_some());
        assert_eq!(
            device.channels.get(&1).unwrap().config.role,
            protobufs::channel::Role::Primary as i32
        );
    }

    #[test]
    fn set_config() {
        let display_config = protobufs::config::DisplayConfig {
            ..Default::default()
        };

        let config_packet = protobufs::Config {
            payload_variant: Some(protobufs::config::PayloadVariant::Display(display_config)),
        };

        let variant = protobufs::from_radio::PayloadVariant::Config(config_packet);

        let mut device = initialize_mock_device();
        let result = device
            .handle_packet_from_radio(generate_mock_fromradio_packet(variant))
            .unwrap();

        assert!(result.device_updated);
        assert!(!result.regenerate_graph);
        assert!(result.notification_config.is_none());

        assert!(device.config.display.is_some());
    }

    #[test]
    fn set_my_node_info() {
        let my_node_info = protobufs::MyNodeInfo::default();

        let variant = protobufs::from_radio::PayloadVariant::MyInfo(my_node_info);

        let mut device = initialize_mock_device();
        let result = device
            .handle_packet_from_radio(generate_mock_fromradio_packet(variant))
            .unwrap();

        assert!(result.device_updated);
        assert!(!result.regenerate_graph);
        assert!(result.notification_config.is_none());
    }

    #[test]
    fn set_and_update_node_info() {
        // Set NodeInfo in device storage

        let node_info1 = protobufs::NodeInfo {
            num: 1,
            last_heard: 1500,
            ..Default::default()
        };

        let variant1 = protobufs::from_radio::PayloadVariant::NodeInfo(node_info1);

        let mut device = initialize_mock_device();
        let result1 = device
            .handle_packet_from_radio(generate_mock_fromradio_packet(variant1))
            .unwrap();

        // Assert NodeInfo initialized correctly

        assert!(result1.device_updated);
        assert!(!result1.regenerate_graph);
        assert!(result1.notification_config.is_none());

        assert!(device.nodes.get(&1).is_some());

        // Check time set within a second of current time
        assert!(
            get_current_time_u32() - 1000
                < device
                    .nodes
                    .get(&1)
                    .unwrap()
                    .last_heard
                    .as_ref()
                    .unwrap()
                    .timestamp
        );

        // Update NodeInfo in device state

        let node_info2 = protobufs::NodeInfo {
            num: 1,
            last_heard: 2000,
            ..Default::default()
        };

        let variant2 = protobufs::from_radio::PayloadVariant::NodeInfo(node_info2);
        let _result2 = device
            .handle_packet_from_radio(generate_mock_fromradio_packet(variant2))
            .unwrap();

        // Assert NodeInfo updated correctly

        assert!(device.nodes.get(&1).is_some());

        // Check time set within a second of current time
        assert!(
            get_current_time_u32() - 1000
                < device
                    .nodes
                    .get(&1)
                    .unwrap()
                    .last_heard
                    .as_ref()
                    .unwrap()
                    .timestamp
        );
    }

    #[test]
    fn handle_mesh_packet() {}
}
