// public protobuf conversion factors, used to load graph and mock data. See mesh.proto

/* Lat: 1e-7 conversion from int to floating point degrees; see mesh.proto */
pub const LAT_CONVERSION_FACTOR: f64 = 1e-7;
/* Longitude: 1e-7 conversion from int to floating point degrees; see mesh.proto */
pub const LON_CONVERSION_FACTOR: f64 = 1e-7;
/* Altitude: in meters above sea level, no conversion needed */
pub const ALT_CONVERSION_FACTOR: f64 = 1.0;
// radius of the earth in km
pub const RADIUS_EARTH_KM: f64 = 6371.0;
