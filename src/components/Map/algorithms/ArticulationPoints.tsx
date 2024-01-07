import {
  AlgorithmSelector,
  LastRan,
} from "@components/Map/algorithms/CommonComps";

export interface ArticulationPointsProps {
  articulationPoints: string[] | null;
  isAPSet: boolean;
  setAP: (checked: boolean) => void;
}

// component ArticulationPoints receives a list of nodes that are articulation points
// and displays them in a list
export const ArticulationPoints = ({
  articulationPoints,
  isAPSet,
  setAP,
}: ArticulationPointsProps) => {
  return (
    <div className="flex-col">
      <AlgorithmSelector
        algorithm="Articulation Points"
        isSet={isAPSet}
        setAlgorithm={setAP}
      />
      <p>
        Articulation points are nodes that, when removed, will disconnect the
        graph. Consider messaging these nodes to inform them of the situation.
      </p>
      <ul className="flex-col py-4">
        {articulationPoints
          ? articulationPoints.map((node, index) => (
              // alternating background colors for each node based on index's parity
              <li
                className={`flex rounded-md justify-between items-center px-5 py-2 ${
                  index % 2 === 0 ? "bg-slate-50" : "bg-white"
                }`}
                key={node}
              >
                <span className="text-gray-700 text-sm font-medium">
                  {node}
                </span>
              </li>
            ))
          : "No results"}
      </ul>
      <LastRan lastRanMinutes={5} />
    </div>
  );
};
