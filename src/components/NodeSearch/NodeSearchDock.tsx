import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMap } from "react-map-gl";

import type {
  app_device_MeshDevice,
  app_device_MeshNode,
} from "@bindings/index";

import NodeSearchInput from "@components/NodeSearch/NodeSearchInput";
import NodeSearchResult from "@components/NodeSearch/NodeSearchResult";

import {
  selectActiveNodeId,
  selectDevice,
  selectAllNodes,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";

import { MapIDs } from "@utils/map";

interface _INodeSearchDockProps {
  filteredNodes: app_device_MeshNode[];
  device: app_device_MeshDevice | null;
  activeNodeId: number | null;
  query: string;
  handleNodeSelect: (nodeId: number) => void;
}

const _NodeSearchDock = ({
  filteredNodes,
  device,
  activeNodeId,
  query,
  handleNodeSelect,
}: _INodeSearchDockProps) => {
  if (!filteredNodes.length && !!device) {
    return (
      <p className="text-sm font-normal text-gray-500">
        No results for &quot;{query}&quot;
      </p>
    );
  }

  if (filteredNodes.length) {
    return (
      <>
        {filteredNodes.map((node) => (
          <NodeSearchResult
            key={node.data.num}
            node={node}
            isActive={node.data.num === activeNodeId}
            selectNode={handleNodeSelect}
          />
        ))}
      </>
    );
  }

  return <></>;
};

const filterNodes =
  (query: string) =>
  (node: app_device_MeshNode): boolean => {
    // Show all nodes on empty query
    if (!query) {
      return true;
    }

    const lowercaseQuery = query.toLocaleLowerCase();

    if (String(node.data.num).includes(lowercaseQuery)) return true;

    if (node.data.user?.shortName.toLocaleLowerCase().includes(lowercaseQuery))
      return true;

    if (node.data.user?.longName.toLocaleLowerCase().includes(lowercaseQuery))
      return true;

    return false;
  };

const NodeSearchDock = () => {
  const dispatch = useDispatch();
  const { [MapIDs.MapView]: map } = useMap();

  const nodes = useSelector(selectAllNodes());
  const device = useSelector(selectDevice());
  const activeNodeId = useSelector(selectActiveNodeId());

  const [query, setQuery] = useState("");

  const handleNodeSelect = (nodeId: number) => {
    const isNodeActive = activeNodeId === nodeId;
    dispatch(deviceSliceActions.setActiveNode(isNodeActive ? null : nodeId));

    // Only animate when node is not currently active
    if (isNodeActive) return;

    const foundNode = nodes.find((node) => node.data.num === nodeId);
    if (!foundNode?.data.position) return;

    map?.flyTo({
      center: [
        foundNode.data.position.longitudeI / 1e7,
        foundNode.data.position.latitudeI / 1e7,
      ],
      duration: 900,
    });
  };

  return (
    <div className="absolute left-9 top-9 w-96 flex flex-col p-4 gap-4">
      <div className="flex flex-row gap-4">
        <NodeSearchInput
          query={query}
          setQuery={setQuery}
          placeholder="Filter nodes"
        />
      </div>

      <div className="flex flex-col gap-4 px-4 py-3 default-overlay overflow-auto hide-scrollbar max-h-72">
        <_NodeSearchDock
          filteredNodes={nodes.filter(filterNodes(query))}
          device={device}
          activeNodeId={activeNodeId}
          query={query}
          handleNodeSelect={handleNodeSelect}
        />
      </div>
    </div>
  );
};

export default NodeSearchDock;
