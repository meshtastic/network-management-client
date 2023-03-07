import React from "react";
import classNames from "classnames";
import { LastRan, AlgorithmSelector } from "./CommonComps";

export interface MincutEdgesInterface {
  edges: string[][];
  isMincutSet: boolean;
  setMinCut: (checked: boolean) => void;
}

const MincutEdges = ({
  edges,
  isMincutSet,
  setMinCut,
}: MincutEdgesInterface) => {
  return (
    <div>
      <AlgorithmSelector
        algorithm="Min Cut Edges"
        isSet={isMincutSet}
        setAlgorithm={setMinCut}
      />
      <p>
        Min cut edges are the smallest set of edges that, when removed, will
        disconnect the graph. Consider messaging the nodes on these edges to
        inform them of the situation.
      </p>
      <ul className="flex-col py-4">
        {edges.map((edge, index) => (
          // edge is a tuple of two strings. We want to display the two strings with an arrow icon in between
          <li
            className={classNames(
              "flex rounded-md justify-between items-center px-5 py-2",
              index % 2 === 0 ? "bg-slate-50" : "bg-white"
            )}
            key={edge[0] + edge[1]}
          >
            <span className="text-gray-700 text-sm font-medium">{edge[0]}</span>
            <span className="text-gray-700 text-sm font-medium">{"->"}</span>
            <span className="text-gray-700 text-sm font-medium">{edge[1]}</span>
          </li>
        ))}
      </ul>
      <LastRan lastRanMinutes={5} />
    </div>
  );
};

export default MincutEdges;
