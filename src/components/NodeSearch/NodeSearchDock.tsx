import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import NodeSearchResult from '@components/NodeSearch/NodeSearchResult';
import { selectActiveNode, selectAllNodes } from '@features/device/deviceSelectors';
import { deviceSliceActions } from '@features/device/deviceSlice';

const NodeSearchDock = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes());
  const activeNodeId = useSelector(selectActiveNode());

  const handleNodeSelect = (nodeId: number) => {
    dispatch(deviceSliceActions.setActiveNode(nodeId));
  }

  return (
    <div className="absolute left-9 top-9 flex flex-col gap-4 px-4 py-3 bg-white rounded-lg border-gray-100 shadow-lg">
      {nodes.map((node) => (
        <NodeSearchResult
          key={node.data.num}
          node={node}
          isActive={node.data.num === activeNodeId}
          selectNode={handleNodeSelect}
        />
      ))}
    </div>
  );
};

export default NodeSearchDock;
