import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GeoJsonLayer, PickingInfo } from "deck.gl/typed";
import {
  CollisionFilterExtension,
  PathStyleExtension,
} from "@deck.gl/extensions/typed";
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
  MapProvider,
  Marker,
} from "react-map-gl";
import { invoke } from "@tauri-apps/api/tauri";
import { useDebounce } from "react-use";
import * as Separator from "@radix-ui/react-separator";
import { MapPin, X } from "lucide-react";

import type { app_protobufs_Waypoint } from "@bindings/index";

import AnalyticsPane from "@components/Map/AnalyticsPane";
import MapInteractionPane from "@components/Map/MapInteractionPane";
import NodeSearchDock from "@components/NodeSearch/NodeSearchDock";
import MapSelectedNodeMenu from "@components/Map/MapSelectedNodeMenu";

import Waypoints from "@components/Waypoints/Waypoint";
import WaypointMenu from "@components/Waypoints/WaypointMenu";
import WaypointMenuEdit from "@components/Waypoints/WaypointMenuEdit";
import MapContextOption from "@components/Map/MapContextOption";
import MapEdgeTooltip from "@components/Map/MapEdgeTooltip";
import MapNodeTooltip from "@components/Map/MapNodeTooltip";

import {
  selectActiveNodeId,
  selectAllWaypoints,
  selectInfoPane,
  selectPlaceholderWaypoint,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";
import { selectMapState } from "@features/map/mapSelectors";
import { mapSliceActions } from "@features/map/mapSlice";

import { MapIDs } from "@utils/map";

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
  const { nodesFeatureCollection, edgesFeatureCollection, viewState, config } =
    useSelector(selectMapState());
  const showInfoPane = useSelector(selectInfoPane());

  const waypoints = useSelector(selectAllWaypoints());
  const tempWaypoint = useSelector(selectPlaceholderWaypoint());

  const [nodeHoverInfo, setNodeHoverInfo] = useState<PickingInfo | null>(null);
  const [edgeHoverInfo, setEdgeHoverInfo] = useState<PickingInfo | null>(null);

  const [contextMenuEvent, setContextMenuEvent] =
    useState<MapLayerMouseEvent | null>(null);

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
    const timeout = setInterval(() => {
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
    }, 5000); // 5s

    return () => clearInterval(timeout);
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
        pointType: "circle",
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
            return [59, 130, 246];
          }
          return [55, 65, 81];
        },

        extensions: [new CollisionFilterExtension()],

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

  const handleClick = () => {
    // Clear right click menu
    setContextMenuEvent(null);
  };

  const handleDropWaypoint = (e: MapLayerMouseEvent) => {
    const createdWaypoint: app_protobufs_Waypoint = {
      id: 0,
      latitudeI: e.lngLat.lat * 1e7,
      longitudeI: e.lngLat.lng * 1e7,
      // TODO add selector for this
      expire: Math.round(moment().add(1, "years").valueOf() / 1000), // Expires one year from today
      lockedTo: 0, // Not locked
      name: "",
      description: "",
      icon: 0, // No icon
    };

    // Save temporary waypoint in redux, and change the type of popup
    dispatch(deviceSliceActions.setActiveWaypoint(0));
    dispatch(deviceSliceActions.setPlaceholderWaypoint(createdWaypoint));
    dispatch(deviceSliceActions.setInfoPane("waypointEdit"));
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
    <MapProvider>
      <div
        className="relative w-full h-full z-0"
        onContextMenu={(e) => e.preventDefault()}
      >
        {nodeHoverInfo && <MapNodeTooltip hoverInfo={nodeHoverInfo} />}
        {edgeHoverInfo && <MapEdgeTooltip hoverInfo={edgeHoverInfo} />}

        <Map
          id={MapIDs.MapView}
          reuseMaps={false} // ! Crashes map on switch back to map tab if set to `true`
          mapStyle={config.style}
          mapLib={maplibregl}
          onDragEnd={handleUpdateViewState}
          onZoomEnd={handleUpdateViewState}
          initialViewState={viewState}
          onClick={handleClick}
          onContextMenu={setContextMenuEvent}
        >
          <DeckGLOverlay pickingRadius={12} layers={layers} />

          {contextMenuEvent && (
            <Marker
              latitude={contextMenuEvent.lngLat.lat}
              longitude={contextMenuEvent.lngLat.lng}
            >
              <div className="translate-y-1/2">
                {/* https://www.kindacode.com/article/how-to-create-triangles-with-tailwind-css-4-examples/ */}
                <div className="w-full">
                  <div className="mx-auto w-0 h-0 border-l-[6px] border-l-transparent border-b-[8px] border-b-gray-200 border-r-[6px] border-r-transparent" />
                </div>

                <div className="flex flex-col gap-2 default-overlay p-2">
                  <MapContextOption
                    text="Drop a waypoint here"
                    renderIcon={(c) => (
                      <MapPin className={c} strokeWidth={1.5} />
                    )}
                    onClick={() => handleDropWaypoint(contextMenuEvent)}
                  />
                  <Separator.Root
                    className="h-px w-full bg-gray-200"
                    decorative
                    orientation="horizontal"
                  />
                  <MapContextOption
                    text="Close menu"
                    renderIcon={(c) => <X className={c} strokeWidth={1.5} />}
                    onClick={() => setContextMenuEvent(null)}
                  />
                </div>
              </div>
            </Marker>
          )}

          {/* Controls at bottom right */}
          <ScaleControl
            maxWidth={144}
            position="bottom-right"
            unit="imperial"
          />
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

        <NodeSearchDock />
        <MapSelectedNodeMenu />
        <MapInteractionPane />
      </div>
    </MapProvider>
  );
};
