export enum MapIDs {
  MapView = "MapView",
  CreateWaypointDialog = "CreateWaypointDialog",
}

export const formatLocation = (location: number): string =>
  `${location.toFixed(5)}°`;
