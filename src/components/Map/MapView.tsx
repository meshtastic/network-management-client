import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeckGL, GeoJsonLayer, PickingInfo } from "deck.gl/typed";
import maplibregl from "maplibre-gl";
import moment from "moment";

import {
  Layer,
  Map,
  NavigationControl,
  ScaleControl,
  Source,
  ViewStateChangeEvent,
  MapLayerMouseEvent,
  ViewState,
} from "react-map-gl";
import { invoke } from "@tauri-apps/api/tauri";

import AnalyticsPane from "./AnalyticsPane";
import MapInteractionPane from "@components/Map/MapInteractionPane";
import MapNode from "@components/Map/MapNode";
import NodeSearchDock from "@components/NodeSearch/NodeSearchDock";
import MapSelectedNodeMenu from "@components/Map/MapSelectedNodeMenu";

import Waypoints from "@app/components/Waypoints/Waypoint";
import WaypointMenu from "@components/Waypoints/WaypointMenu";
import WaypointMenuEdit from "@components/Waypoints/WaypointMenuEdit";
import MapEdgeTooltip from "@components/Map/MapEdgeTooltip";

import type { Waypoint } from "@bindings/protobufs/Waypoint";

import {
  selectActiveNodeId,
  selectAllNodes,
  selectAllWaypoints,
  selectAllowOnMapWaypointCreation,
  selectInfoPane,
  selectPlaceholderWaypoint,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectMapState } from "@features/map/mapSelectors";
import { mapSliceActions } from "@features/map/mapSlice";

import "@components/Map/MapView.css";

// const DATA_URL = {
//   ACCIDENTS:
//     "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/highway/accidents.csv",
//   ROADS:
//     "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/highway/roads.json",
// };

// function getKey({ state, type, id }) {
//   return `${state}-${type}-${id}`;
// }

// export const COLOR_SCALE = scaleThreshold()
//   .domain([0, 4, 8, 12, 20, 32, 52, 84, 136, 220])
//   .range([
//     [26, 152, 80],
//     [102, 189, 99],
//     [166, 217, 106],
//     [217, 239, 139],
//     [255, 255, 191],
//     [254, 224, 139],
//     [253, 174, 97],
//     [244, 109, 67],
//     [215, 48, 39],
//     [168, 0, 0],
//   ]);

// const WIDTH_SCALE = scaleLinear()
//   .clamp(true)
//   .domain([0, 200])
//   .range([10, 2000]);

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 0,
};

// const MAP_STYLE =
//   "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

// function aggregateAccidents(accidents: any) {
//   const incidents = {};
//   const fatalities = {};

//   if (accidents) {
//     accidents.forEach((a) => {
//       const r = (incidents[a.year] = incidents[a.year] || {});
//       const f = (fatalities[a.year] = fatalities[a.year] || {});
//       const key = getKey(a);
//       r[key] = a.incidents;
//       f[key] = a.fatalities;
//     });
//   }
//   return { incidents, fatalities };
// }

// function renderTooltip({ fatalities, incidents, year, hoverInfo }) {
//   const { object, x, y } = hoverInfo;

//   if (!object) {
//     return null;
//   }

//   const props = object.properties;
//   const key = getKey(props);
//   const f = fatalities[year][key];
//   const r = incidents[year][key];

//   const content = r ? (
//     <div>
//       <b>{f}</b> people died in <b>{r}</b> crashes on{" "}
//       {props.type === "SR" ? props.state : props.type}-{props.id} in{" "}
//       <b>{year}</b>
//     </div>
//   ) : (
//     <div>
//       no accidents recorded in <b>{year}</b>
//     </div>
//   );

//   return (
//     <div className="tooltip" style={{ left: x, top: y }}>
//       <big>
//         {props.name} ({props.state})
//       </big>
//       {content}
//     </div>
//   );
// }

export const MapView = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes());
  const activeNodeId = useSelector(selectActiveNodeId());
  const { edgesFeatureCollection, viewState } = useSelector(selectMapState());
  const showInfoPane = useSelector(selectInfoPane());

  const waypoints = useSelector(selectAllWaypoints());
  const newWaypointAllowed = useSelector(selectAllowOnMapWaypointCreation());
  const tempWaypoint = useSelector(selectPlaceholderWaypoint());

  const [hoverInfo, setHoverInfo] = useState<PickingInfo | null>(null);

  // const [viewState, setViewState] =
  //   useState<Record<string, any>>(INITIAL_VIEW_STATE);
  console.warn("viewState", viewState);

  // const handleClick = (e: MapLayerMouseEvent) => {
  //   // Can only create new waypoint if the state is toggled
  //   if (newWaypointAllowed) {
  //     const createdWaypoint: Waypoint = {
  //       id: 0,
  //       latitudeI: Math.round(e.lngLat.lat * 1e7), // Location clicked
  //       longitudeI: Math.round(e.lngLat.lng * 1e7),
  //       expire: Math.round(moment().add(1, "years").valueOf() / 1000), // Expires one year from today
  //       lockedTo: 0, // Public
  //       name: "New Waypoint",
  //       description: "",
  //       icon: 0, // Default
  //     };

  //     // Save temporary waypoint in redux, and change the type of popup
  //     dispatch(deviceSliceActions.setActiveWaypoint(0));
  //     dispatch(deviceSliceActions.setPlaceholderWaypoint(createdWaypoint));
  //     dispatch(deviceSliceActions.setInfoPane("waypointEdit"));
  //     dispatch(deviceSliceActions.setAllowOnMapWaypointCreation(false));
  //   }
  // };

  // const updateActiveNode = (nodeId: number | null) => {
  //   if (nodeId === activeNodeId) {
  //     return dispatch(deviceSliceActions.setActiveNode(null));
  //   }

  //   dispatch(deviceSliceActions.setActiveNode(nodeId));
  // };

  // const handleMoveEnd = (e: ViewStateChangeEvent) => {
  //   dispatch(
  //     mapSliceActions.setPosition({
  //       latitude: e.viewState.latitude,
  //       longitude: e.viewState.longitude,
  //     })
  //   );
  // };

  // const handleZoomEnd = (e: ViewStateChangeEvent) => {
  //   dispatch(mapSliceActions.setZoom(e.viewState.zoom));
  // };

  // useEffect(() => {
  //   invoke("get_node_edges")
  //     .then((c) =>
  //       dispatch(
  //         mapSliceActions.setEdgesFeatureCollection(
  //           c as GeoJSON.FeatureCollection
  //         )
  //       )
  //     )
  //     .catch(() => dispatch(mapSliceActions.setEdgesFeatureCollection(null)));
  // }, []);

  // const layers = useMemo(
  //   () => [
  //     new GeoJsonLayer({
  //       id: "geojson",
  //       pointType: "circle",
  //       // data: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/highway/roads.json",
  //       data: edgesFeatureCollection || {},
  //       stroked: false,
  //       filled: false,
  //       lineWidthMinPixels: 1,
  //       parameters: {
  //         depthTest: false,
  //       },

  //       getLineColor: (f) => {
  //         console.log("f", f.properties?.snr);
  //         switch (f.properties?.snr) {
  //           case 1:
  //             return [255, 0, 0];
  //           case 2:
  //             return [0, 255, 0];
  //           case 3:
  //             return [0, 0, 255];
  //           default:
  //             return [0, 0, 0];
  //         }
  //       },
  //       // getLineWidth,

  //       pickable: true,
  //       onHover: setHoverInfo,

  //       // updateTriggers: {
  //       //   getLineColor: { year },
  //       //   getLineWidth: { year },
  //       // },

  //       // transitions: {
  //       //   getLineColor: 1000,
  //       //   getLineWidth: 1000,
  //       // },
  //     }),
  //   ],
  //   [edgesFeatureCollection]
  // );

  return (
    <div className="relative w-full h-full z-0">
      <DeckGL
        pickingRadius={5}
        // initialViewState={viewState}
        // initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        onViewStateChange={({ viewState }) =>
          dispatch(mapSliceActions.setViewState(viewState))
        }
        controller={true}
        layers={[]}
      >
        {/* <MapEdgeTooltip hoverInfo={hoverInfo} /> */}

        <Map
          // mapStyle="https://raw.githubusercontent.com/hc-oss/maplibre-gl-styles/master/styles/osm-mapnik/v8/default.json"
          // mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json"
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          mapLib={maplibregl}
          // attributionControl={false}
          // initialViewState={viewState}
          // onMoveEnd={handleMoveEnd}
          // onZoomEnd={handleZoomEnd}
          // onClick={handleClick}
        >
          {/* Controls at bottom right */}
          <ScaleControl
            maxWidth={144}
            position="bottom-right"
            unit="imperial"
          />
          <NavigationControl position="bottom-right" showCompass={false} />

          {/* Algorithm Visualization */}
          {/* {edgesFeatureCollection && (
            <Source type="geojson" data={edgesFeatureCollection}>
              <Layer
                id="lineLayer"
                type="line"
                source="line-data"
                paint={{
                  "line-color": "#6F7986",
                  "line-dasharray": [2, 1],
                  "line-width": 4,
                }}
              />
            </Source>
          )} */}

          {/* Visualize all nodes */}
          {/* {nodes
            .filter(
              (n) =>
                !!n.data.position?.latitudeI && !!n.data.position?.longitudeI
            )
            .map((node) => (
              <MapNode
                key={node.data.num}
                onClick={updateActiveNode}
                node={node}
                isBase={false}
                isActive={activeNodeId === node.data.num}
              />
            ))} */}

          {/* Visualize all waypoints */}
          {/* {waypoints
            .filter(
              (n) => !!n.latitudeI && !!n.longitudeI // Shows pins with valid latitudes
            )
            .map((eachWaypoint) => (
              <Waypoints key={eachWaypoint.id} currWaypoint={eachWaypoint} />
            ))} */}

          {/* <Waypoints currWaypoint={tempWaypoint}></Waypoints> */}

          {/* Popups */}
          {/* {showInfoPane == "waypoint" ? (
            <WaypointMenu />
          ) : showInfoPane == "waypointEdit" ? (
            <WaypointMenuEdit />
          ) : showInfoPane == "algos" ? (
            <AnalyticsPane />
          ) : null} */}

          <MapSelectedNodeMenu />

          <NodeSearchDock />
          <MapInteractionPane />
        </Map>
      </DeckGL>
    </div>
  );
};
