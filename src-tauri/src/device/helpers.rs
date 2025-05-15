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
    let db_user = db_node.user.as_ref()?;

    Some(db_user.long_name.clone())
}

pub fn get_channel_name(device: &mut MeshDevice, channel_id: &u32) -> Option<String> {
    let db_channel = device.channels.get(channel_id)?;
    let db_channel_settings = db_channel.config.settings.as_ref()?;

    if db_channel_settings.name.is_empty() {
        return format!("Channel {}", db_channel.config.index).into();
    }

    Some(db_channel_settings.name.clone())
}

/// Converts a mesh location field (e.g., latitude) from
/// its mesh integer representation to a float.
///
/// # Arguments
///
/// * `field` - The mesh location field to convert.
///
/// # Returns
///
/// * `f32` - The converted mesh location field.
///
pub fn normalize_location_field(field: i32) -> f32 {
    (field as f64 / 1e7) as f32
}

/// Converts a location field (e.g., latitude) to the
/// standard mesh integer representation.
///
/// # Arguments
///
/// * `field` - The location field to convert.
///
/// # Returns
///
/// * `i32` - The converted location field.
///
pub fn convert_location_field_to_protos(field: f32) -> i32 {
    (field * 1e7).floor() as i32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_location_field() {
        let lat = 27_030_000; // Represents 2.703 latitude
        let norm_lat = normalize_location_field(lat);
        assert!((norm_lat - 2.703).abs() < 1e-6); // Use tolerance for float comparison
    }

    #[test]
    fn test_convert_location_field_to_protos() {
        let lat = 2.703;
        let mesh_lat = convert_location_field_to_protos(lat);
        assert_eq!(mesh_lat, 27_030_000);
    }
}
