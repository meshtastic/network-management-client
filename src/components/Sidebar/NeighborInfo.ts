/*
 * This is the frontend interface to run algorithms on the graph data. It pulls specific
 * information from protobufs and assembles it into a serializable interface, the analog of which is
 * the NeighborInfo rust struct in the backend.
 */
export interface NeighborInfo {
  selfnode: Neighbor;
  neighbors: Neighbor[];
}

export interface Neighbor {
  id: number;
  snr: number;
  lat: number;
  lon: number;
  alt: number;
}
