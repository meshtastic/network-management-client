import type { INode } from "@features/device/deviceSlice";
export { generateDemoData, generateNeighborInfo };
import type { NeighborInfo, Neighbor } from "./NeighborInfo";

/*
 * This file initializes three empty nodes, each at different locations in Hanover
 * with corresponding SNRs. Used for testing algorithm and demo flow only
 */
function generateDemoData(): INode[] {
  const addr = new Uint8Array(6);
  const firstNode: INode = {
    data: {
      num: 1439091100,
      snr: 0,
      lastHeard: 0,
      user: {
        id: "node1",
        longName: "Node 1",
        shortName: "N1",
        macaddr: addr,
        hwModel: 0,
        isLicensed: false,
      },
      position: {
        latitudeI: 437030000,
        longitudeI: -722890000,
        altitude: 0,
        time: 0,
        locationSource: 0,
        altitudeSource: 0,
        timestamp: 0,
        timestampMillisAdjust: 0,
        altitudeHae: 0,
        altitudeGeoidalSeparation: 0,
        pDOP: 0,
        hDOP: 0,
        vDOP: 0,
        gpsAccuracy: 0,
        groundSpeed: 0,
        groundTrack: 0,
        fixQuality: 0,
        fixType: 0,
        satsInView: 0,
        sensorId: 0,
        nextUpdate: 0,
        seqNumber: 0,
      },
    },
    deviceMetrics: [],
    environmentMetrics: [],
  };

  const secondNode: INode = {
    data: {
      num: 1439134708,
      snr: 0,
      lastHeard: 0,
      user: {
        id: "node2",
        longName: "Node 2",
        shortName: "N2",
        macaddr: addr,
        hwModel: 0,
        isLicensed: false,
      },
      position: {
        latitudeI: 437030001,
        longitudeI: -722890001,
        altitude: 0,
        time: 0,
        locationSource: 0,
        altitudeSource: 0,
        timestamp: 0,
        timestampMillisAdjust: 0,
        altitudeHae: 0,
        altitudeGeoidalSeparation: 0,
        pDOP: 0,
        hDOP: 0,
        vDOP: 0,
        gpsAccuracy: 0,
        groundSpeed: 0,
        groundTrack: 0,
        fixQuality: 0,
        fixType: 0,
        satsInView: 0,
        sensorId: 0,
        nextUpdate: 0,
        seqNumber: 0,
      },
    },
    deviceMetrics: [],
    environmentMetrics: [],
  };

  const thirdNode: INode = {
    data: {
      num: 1439175496,
      snr: 0,
      lastHeard: 0,
      user: {
        id: "node3",
        longName: "Node 3",
        shortName: "N3",
        macaddr: addr,
        hwModel: 0,
        isLicensed: false,
      },
      position: {
        latitudeI: 437030002,
        longitudeI: -722890002,
        altitude: 0,
        time: 0,
        locationSource: 0,
        altitudeSource: 0,
        timestamp: 0,
        timestampMillisAdjust: 0,
        altitudeHae: 0,
        altitudeGeoidalSeparation: 0,
        pDOP: 0,
        hDOP: 0,
        vDOP: 0,
        gpsAccuracy: 0,
        groundSpeed: 0,
        groundTrack: 0,
        fixQuality: 0,
        fixType: 0,
        satsInView: 0,
        sensorId: 0,
        nextUpdate: 0,
        seqNumber: 0,
      },
    },
    deviceMetrics: [],
    environmentMetrics: [],
  };

  return [firstNode, secondNode, thirdNode];
}

/*
 * Take the provided INodes and generate a NeighborInfo object
 */
function generateNeighborInfo(nodeList: INode[]): NeighborInfo[] {
  const neighborInfo: NeighborInfo[] = [];
  for (const node of nodeList) {
    const latitude = node.data.position ? node.data.position.latitudeI : 0;
    const longitude = node.data.position ? node.data.position.longitudeI : 0;
    const altitude = node.data.position ? node.data.position.altitude : 0;
    const nbr: Neighbor = {
      id: node.data.num,
      snr: node.data.snr,
      lat: latitude,
      lon: longitude,
      alt: altitude,
    };
    const nbrInfo: NeighborInfo = {
      selfnode: nbr,
      neighbors: [],
    };
    neighborInfo.push(nbrInfo);
  }

  /*
   * Make the demo assumption that the graph is fully connected.
   */
  for (const emptyNbrInfo of neighborInfo) {
    for (const nodeRegistered of neighborInfo) {
      emptyNbrInfo.neighbors.push(nodeRegistered.selfnode);
    }
  }

  return neighborInfo;
}
