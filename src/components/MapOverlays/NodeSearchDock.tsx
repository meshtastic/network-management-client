import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveNode, selectAllNodes } from '@features/device/deviceSelectors';

const NodeSearchDock = () => {
  const nodes = useSelector(selectAllNodes());
  const activeNodeId = useSelector(selectActiveNode());

  return (
    <div className="absolute left-9 top-9 px-4 py-3 bg-white rounded-lg border-gray-100 shadow-lg">
      {nodes.map((node) => (
        <div key={node.data.num}>
          {node.data.num === activeNodeId ? "* " : ""}
          {node.data.num}
        </div>
      ))}
    </div>
  );
};

export default NodeSearchDock;