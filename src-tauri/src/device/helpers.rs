use rand::{distributions::Standard, prelude::Distribution, Rng};
use std::time::UNIX_EPOCH;

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
