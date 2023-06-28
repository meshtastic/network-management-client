export enum MapIDs {
  MapView = "MapView",
}

export const formatLocation = (location: number): string =>
  `${location.toFixed(5)}°`;
