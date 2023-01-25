// public protobuf conversion factors, used to load graph and mock data. See mesh.proto

/* Lat: 1e-7 conversion from int to floating point degrees; see mesh.proto */
pub const LAT_CONVERSION_FACTOR: f64 = 1e-7;
/* Longitude: 1e-7 conversion from int to floating point degrees; see mesh.proto */
pub const LON_CONVERSION_FACTOR: f64 = 1e-7;
/* Altitude: in meters above sea level, no conversion needed */
pub const ALT_CONVERSION_FACTOR: f64 = 1.0;

/*
Append two GPS decimal points to beginning of randomly generated latitude and longitude to simulate a moving network
within the Hanover area.
GPS precision is as follows:
1 decimal point - 11.1 km
2 decimal points - 1.11 km
3 decimal points - 110 meters
4 decimal points - 11 meters
See https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude/8674#8674
*/
pub const HANOVER_LON_PREFIX: f64 = 43.70;
pub const HANOVER_LAT_PREFIX: f64 = 72.28;

// radius of the earth in km
pub const RADIUS_EARTH_KM: f64 = 6371.0;
