import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GeoJsonLayer, PickingInfo } from "deck.gl/typed";
import { PathStyleExtension } from "@deck.gl/extensions/typed";
import { BASEMAP } from "@deck.gl/carto/typed";
import maplibregl from "maplibre-gl";
import moment from "moment";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import {
  Map,
  NavigationControl,
  ScaleControl,
  ViewStateChangeEvent,
  MapLayerMouseEvent,
  ViewState,
  useControl,
} from "react-map-gl";
import { invoke } from "@tauri-apps/api/tauri";
import { useDebounce } from "react-use";

import type { app_protobufs_Waypoint } from "@bindings/index";

import AnalyticsPane from "@components/Map/AnalyticsPane";
import MapInteractionPane from "@components/Map/MapInteractionPane";
import NodeSearchDock from "@components/NodeSearch/NodeSearchDock";
import MapSelectedNodeMenu from "@components/Map/MapSelectedNodeMenu";

import Waypoints from "@app/components/Waypoints/Waypoint";
import WaypointMenu from "@components/Waypoints/WaypointMenu";
import WaypointMenuEdit from "@components/Waypoints/WaypointMenuEdit";
import MapNodeTooltip from "@components/Map/MapNodeTooltip";
import MapEdgeTooltip from "@components/Map/MapEdgeTooltip";

import {
  selectActiveNodeId,
  selectAllWaypoints,
  selectAllowOnMapWaypointCreation,
  selectInfoPane,
  selectPlaceholderWaypoint,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectMapState } from "@features/map/mapSelectors";
import { mapSliceActions } from "@features/map/mapSlice";

import "@components/Map/MapView.css";

export interface IDeckGLOverlayProps extends MapboxOverlayProps {
  interleaved?: boolean;
}

const DeckGLOverlay = (props: IDeckGLOverlayProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  overlay.setProps(props);

  return null;
};

export const MapView = () => {
  const dispatch = useDispatch();
  const activeNodeId = useSelector(selectActiveNodeId());
  const { nodesFeatureCollection, edgesFeatureCollection, viewState } =
    useSelector(selectMapState());
  const showInfoPane = useSelector(selectInfoPane());

  const waypoints = useSelector(selectAllWaypoints());
  const newWaypointAllowed = useSelector(selectAllowOnMapWaypointCreation());
  const tempWaypoint = useSelector(selectPlaceholderWaypoint());

  const [nodeHoverInfo, setNodeHoverInfo] = useState<PickingInfo | null>(null);
  const [edgeHoverInfo, setEdgeHoverInfo] = useState<PickingInfo | null>(null);

  const [localViewState, setLocalViewState] =
    useState<Partial<ViewState>>(viewState);

  const handleNodeClick = useCallback(
    (info: PickingInfo) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const nodeId: number | null = info.object?.properties?.num ?? null;

      if (nodeId === activeNodeId) {
        dispatch(deviceSliceActions.setActiveNode(null));
        return;
      }

      dispatch(deviceSliceActions.setActiveNode(nodeId));
    },
    [activeNodeId, dispatch]
  );

  useEffect(() => {
    invoke("get_node_edges")
      .then((c) => {
        const { nodes, edges } = c as {
          nodes: GeoJSON.FeatureCollection;
          edges: GeoJSON.FeatureCollection;
        };

        dispatch(mapSliceActions.setNodesFeatureCollection(nodes));
        dispatch(mapSliceActions.setEdgesFeatureCollection(edges));
      })
      .catch(() => dispatch(mapSliceActions.setEdgesFeatureCollection(null)));
  }, []);

  const layers = useMemo(
    () => [
      new GeoJsonLayer({
        id: "edges",
        data: edgesFeatureCollection || {},
        pointType: "circle",
        extensions: [new PathStyleExtension({ dash: true })],
        getDashArray: [4, 4],
        pickable: true,
        dashJustified: true,
        dashGapPickable: true,
        filled: false,
        lineWidthMinPixels: 2,

        onHover: setEdgeHoverInfo,

        getLineColor: () => {
          return [55, 65, 81];
        },
      }),
      new GeoJsonLayer({
        id: "nodes",
        data: nodesFeatureCollection || {},

        pickable: true,
        stroked: false,

        onClick: handleNodeClick,
        onHover: setNodeHoverInfo,

        pointRadiusUnits: "pixels",
        getPointRadius: (info) => {
          if (activeNodeId && info.properties?.num === activeNodeId) {
            return 6;
          }
          return 4;
        },

        getFillColor: (info) => {
          if (activeNodeId && info.properties?.num === activeNodeId) {
            return [185, 28, 28];
          }
          return [55, 65, 81];
        },

        updateTriggers: {
          getFillColor: { activeNodeId },
          getPointRadius: { activeNodeId },
        },

        transitions: {
          getFillColor: 40,
          getPointRadius: 40,
        },
      }),
    ],
    [
      nodesFeatureCollection,
      edgesFeatureCollection,
      setNodeHoverInfo,
      setEdgeHoverInfo,
      handleNodeClick,
      activeNodeId,
    ]
  );

  const handleClick = (e: MapLayerMouseEvent) => {
    // Can only create new waypoint if the state is toggled
    if (newWaypointAllowed) {
      const createdWaypoint: app_protobufs_Waypoint = {
        id: 0,
        latitudeI: Math.round(e.lngLat.lat * 1e7), // Location clicked
        longitudeI: Math.round(e.lngLat.lng * 1e7),
        expire: Math.round(moment().add(1, "years").valueOf() / 1000), // Expires one year from today
        lockedTo: 0, // Public
        name: "New Waypoint",
        description: "",
        icon: 0, // Default
      };

      // Save temporary waypoint in redux, and change the type of popup
      dispatch(deviceSliceActions.setActiveWaypoint(0));
      dispatch(deviceSliceActions.setPlaceholderWaypoint(createdWaypoint));
      dispatch(deviceSliceActions.setInfoPane("waypointEdit"));
      dispatch(deviceSliceActions.setAllowOnMapWaypointCreation(false));
    }
  };

  useDebounce(
    () => dispatch(mapSliceActions.setViewState(localViewState)),
    500,
    [localViewState]
  );

  const handleUpdateViewState = (e: ViewStateChangeEvent) => {
    setLocalViewState((prevState) => ({ ...prevState, ...e.viewState }));
  };

  return (
    <div
      className="relative w-full h-full z-0"
      onContextMenu={(e) => e.preventDefault()}
    >
      {nodeHoverInfo && <MapNodeTooltip hoverInfo={nodeHoverInfo} />}
      {edgeHoverInfo && <MapEdgeTooltip hoverInfo={edgeHoverInfo} />}

      <Map
        reuseMaps={false} // ! Crashes map on switch back to map tab if set to `true`
        mapStyle={BASEMAP.POSITRON}
        mapLib={maplibregl}
        onDragEnd={handleUpdateViewState}
        onZoomEnd={handleUpdateViewState}
        initialViewState={viewState}
        onClick={handleClick}
      >
        <DeckGLOverlay pickingRadius={12} layers={layers} />

        {/* Controls at bottom right */}
        <ScaleControl maxWidth={144} position="bottom-right" unit="imperial" />
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* Visualize all waypoints */}
        {waypoints
          // Filter invalid locations (falsy lat or long, includes 0,0)
          .filter((n) => !!n.latitudeI && !!n.longitudeI)
          .map((waypoint) => (
            <Waypoints key={waypoint.id} currWaypoint={waypoint} />
          ))}

        <Waypoints currWaypoint={tempWaypoint} />
      </Map>

      {/* Popups */}
      {showInfoPane == "waypoint" ? (
        <WaypointMenu />
      ) : showInfoPane == "waypointEdit" ? (
        <WaypointMenuEdit />
      ) : showInfoPane == "algos" ? (
        <AnalyticsPane />
      ) : null}

      <MapSelectedNodeMenu />

      <NodeSearchDock />
      <MapInteractionPane />
    </div>
  );
};
