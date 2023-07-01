export enum MapIDs {
  MapView = "MapView",
  CreateWaypointDialog = "CreateWaypointDialog",
}

export const formatLocation = (location: number): string =>
  `${location.toFixed(5)}°`;

export const getFlyToConfig = (target: {
  lng: number;
  lat: number;
}): mapboxgl.FlyToOptions => ({
  center: [target.lng, target.lat],
  bearing: 0,
  pitch: 0,
  speed: 0.6,
});
