import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";


import type { MeshNode } from "@bindings/MeshNode";
import type { MeshDevice } from "@bindings/MeshDevice";

import MapIconButton from "@components/Map/MapIconButton";
import NodeSearchInput from "@components/NodeSearch/NodeSearchInput";
import NodeSearchResult from "@components/NodeSearch/NodeSearchResult";

import {
  selectActiveNodeId,
  selectDevice,
  selectAllNodes,
} from "@features/device/deviceSelectors";
import { deviceSliceActions } from "@features/device/deviceSlice";

interface _INodeSearchDockProps {
  filteredNodes: MeshNode[];
  device: MeshDevice | null;
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
      <div className="flex flex-col gap-4 px-4 py-3 default-overlay">
        <p className="text-sm font-normal text-gray-500">
          No results for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  if (filteredNodes.length) {
    return (
      <div className="flex flex-col gap-4 px-4 py-3 default-overlay">
        {filteredNodes.map((node) => (
          <NodeSearchResult
            key={node.data.num}
            node={node}
            isActive={node.data.num === activeNodeId}
            selectNode={handleNodeSelect}
          />
        ))}
      </div>
    );
  }

  return <></>;
};

const NodeSearchDock = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes());
  const device = useSelector(selectDevice());
  const activeNodeId = useSelector(selectActiveNodeId());

  const [filteredNodes, setFilteredNodes] = useState<MeshNode[]>(nodes);
  const [query, setQuery] = useState("");

  const filterNodes = useCallback(() => {
    // Show all nodes on empty query
    if (!query) {
      setFilteredNodes(nodes);
      return;
    }

    const filteredNodes = nodes.filter((node) => {
      const lowercaseQuery = query.toLocaleLowerCase();

      if (String(node.data.num).includes(lowercaseQuery)) return true;

      if (
        node.data.user?.shortName.toLocaleLowerCase().includes(lowercaseQuery)
      )
        return true;

      if (node.data.user?.longName.toLocaleLowerCase().includes(lowercaseQuery))
        return true;

      return false;
    });

    setFilteredNodes(filteredNodes);
  }, [query, nodes, setFilteredNodes]);

  const handleNodeSelect = (nodeId: number) => {
    dispatch(
      deviceSliceActions.setActiveNode(activeNodeId !== nodeId ? nodeId : null)
    );
  };

  useEffect(() => {
    filterNodes();
  }, [filterNodes, nodes]);

  return (
    <div className="absolute left-9 top-9 w-96 flex flex-col p-4 gap-4">
      <div className="flex flex-row gap-4">
        <NodeSearchInput
          query={query}
          setQuery={setQuery}
          placeholder="Search for nodes"
        />
        <MapIconButton className="p-3" type="submit" onClick={filterNodes}>
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
        </MapIconButton>
      </div>

      <_NodeSearchDock
        filteredNodes={filteredNodes}
        device={device}
        activeNodeId={activeNodeId}
        query={query}
        handleNodeSelect={handleNodeSelect}
      />
    </div>
  );
};

export default NodeSearchDock;
