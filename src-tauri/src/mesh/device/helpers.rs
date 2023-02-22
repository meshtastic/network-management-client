use rand::{distributions::Standard, prelude::Distribution, Rng};
use std::time::UNIX_EPOCH;

use super::MeshDevice;

pub fn get_current_time_u32() -> u32 {
    std::time::SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Could not get time since unix epoch")
        .as_secs()
        .try_into()
        .expect("Could not convert u128 to u32")
}

pub fn generate_rand_id<T>() -> T
where
    Standard: Distribution<T>,
{
    let mut rng = rand::thread_rng();
    rng.gen::<T>()
}

pub fn get_node_user_name(device: &mut MeshDevice, node_id: &u32) -> Option<String> {
    let db_node = device.nodes.get(node_id)?;
    let db_user = db_node.data.user.as_ref()?;

    Some(db_user.long_name.clone())
}

pub fn get_channel_name(device: &mut MeshDevice, channel_id: &u32) -> Option<String> {
    let db_channel = device.channels.get(channel_id)?;
    let db_channel_settings = db_channel.config.settings.as_ref()?;

    if db_channel_settings.name == "".to_string() {
        return format!("Channel {}", db_channel.config.index).into();
    }

    Some(db_channel_settings.name.clone())
}
