import {LastRan, AlgorithmSelector} from "./CommonComps";
import React from 'react';
import classNames from 'classnames';

export interface ArticulationPointsProps {
  articulationPoints: string[];
  isAPSet: boolean;
  setAP: (checked: boolean) => void;
}

// component ArticulationPoints receives a list of nodes that are articulation points
// and displays them in a list
const ArticulationPoints = ({ articulationPoints, isAPSet, setAP }: ArticulationPointsProps) => {
  return (
    <div className='flex-col'>
      <AlgorithmSelector algorithm="Articulation Points" isSet={isAPSet} setAlgorithm={setAP} />
      <p>
      Explain what articulation points are. Maybe propose
      suggested actions to take (message these nodes)
      with standard messages.
      </p>      
      <ul className='flex-col py-4'>
        {articulationPoints.map((node, index) => (
          // alternating background colors for each node based on index's parity
          <li
            className={classNames(
              'flex rounded-md justify-between items-center px-5 py-2',
              index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
            )}
            key={node}
          >
            <span className="text-gray-700 text-sm font-medium">{node}</span>

          </li>
          
        ))}
      </ul>
    <LastRan lastRanMinutes={5} />
    </div>
  );
};

export default ArticulationPoints;